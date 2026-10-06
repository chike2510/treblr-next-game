'use client';

import { useEffect, useRef } from 'react';

const shader = /* wgsl */ `
struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOut {
  let positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  var output: VertexOut;
  output.position = vec4<f32>(positions[index], 0.0, 1.0);
  output.uv = vec2<f32>(positions[index].x * 0.5 + 0.5, 0.5 - positions[index].y * 0.5);
  return output;
}

@group(0) @binding(0) var<uniform> frame: vec4<f32>;

@fragment
fn fragmentMain(input: VertexOut) -> @location(0) vec4<f32> {
  let aspect = frame.y / max(frame.z, 1.0);
  let t = frame.x * 0.18;
  let p = (input.uv - vec2<f32>(0.54, 0.46)) * vec2<f32>(aspect, 1.0);
  let fold = sin((p.x * 2.5 + p.y * 3.1 + sin(p.y * 5.0 - t) * 0.14 - t) * 5.0);
  let tide = sin((p.x * 3.4 - p.y * 1.8 + cos(p.x * 4.0 + t * 0.7) * 0.12 + t * 0.72) * 4.1);
  let pearl = smoothstep(0.23, 0.96, 0.52 + fold * 0.27 + tide * 0.21);
  let ember = smoothstep(0.12, 0.93, 0.50 + sin(p.x * 6.0 + p.y * 3.0 - t * 0.8) * 0.5);
  let halo = 1.0 - smoothstep(0.06, 0.9, length(p * vec2<f32>(0.88, 1.0)));
  let ink = vec3<f32>(0.10, 0.08, 0.12);
  let plum = vec3<f32>(0.36, 0.19, 0.29);
  let terracotta = vec3<f32>(0.78, 0.34, 0.22);
  let paper = vec3<f32>(0.95, 0.76, 0.61);
  let coolPearl = vec3<f32>(0.60, 0.76, 0.82);
  var color = mix(ink, plum, clamp(halo * 0.88 + ember * 0.18, 0.0, 1.0));
  color = mix(color, terracotta, ember * (1.0 - pearl) * 0.34);
  color = mix(color, paper, pearl * 0.34);
  color = mix(color, coolPearl, pearl * (0.14 + (1.0 - halo) * 0.12));
  return vec4<f32>(color, 1.0);
}
`;

type GpuNamespace = {
  requestAdapter: () => Promise<any>;
  getPreferredCanvasFormat: () => string;
  BufferUsage: { UNIFORM: number; COPY_DST: number };
};

/** An optional, low-contrast WebGPU shimmer with a warm CSS-only fallback. */
export default function PhoneShader({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const gpu = (navigator as Navigator & { gpu?: GpuNamespace }).gpu;
    if (!canvas || !gpu) return;

    let disposed = false;
    let frameId = 0;
    let device: any;
    let context: any;

    const render = async () => {
      try {
        const adapter = await gpu.requestAdapter();
        if (!adapter || disposed) return;
        device = await adapter.requestDevice();
        if (disposed) {
          device.destroy?.();
          return;
        }
        context = canvas.getContext('webgpu' as any) as any;
        if (!context) return;

        const format = gpu.getPreferredCanvasFormat();
        context.configure({ device, format, alphaMode: 'premultiplied' });
        const module = device.createShaderModule({ code: shader });
        const pipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module, entryPoint: 'vertexMain' },
          fragment: { module, entryPoint: 'fragmentMain', targets: [{ format }] },
          primitive: { topology: 'triangle-list' },
        });
        const uniform = device.createBuffer({ size: 16, usage: gpu.BufferUsage.UNIFORM | gpu.BufferUsage.COPY_DST });
        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: { buffer: uniform } }],
        });
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const startedAt = performance.now();
        canvas.classList.add('is-live');

        const draw = (now: number) => {
          if (disposed) return;
          try {
            const scale = Math.min(window.devicePixelRatio || 1, 1.5);
            const width = Math.max(1, Math.round(canvas.clientWidth * scale));
            const height = Math.max(1, Math.round(canvas.clientHeight * scale));
            if (canvas.width !== width || canvas.height !== height) {
              canvas.width = width;
              canvas.height = height;
            }
            device.queue.writeBuffer(uniform, 0, new Float32Array([
              reducedMotion ? 0 : (now - startedAt) / 1000,
              width,
              height,
              0,
            ]));
            const encoder = device.createCommandEncoder();
            const pass = encoder.beginRenderPass({
              colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: 'clear',
                storeOp: 'store',
              }],
            });
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, bindGroup);
            pass.draw(3);
            pass.end();
            device.queue.submit([encoder.finish()]);
            if (!reducedMotion) frameId = requestAnimationFrame(draw);
          } catch {
            canvas.classList.remove('is-live');
          }
        };

        draw(startedAt);
      } catch {
        // Leave the CSS treatment in place when WebGPU or a driver is unavailable.
      }
    };

    void render();
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      canvas.classList.remove('is-live');
      try { context?.unconfigure?.(); } catch { /* Older implementations may not expose unconfigure. */ }
      try { device?.destroy?.(); } catch { /* The CSS fallback remains available. */ }
    };
  }, [active]);

  return <canvas ref={canvasRef} className="phone-shader" aria-hidden="true" />;
}
