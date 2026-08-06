import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Sliders, RotateCw, Eye, CheckCircle2, Scissors, Palette, Layers, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function WebGLStyleBuilder({ onApplyPreset }) {
  const { toast } = useToast();
  const canvasRef = useRef(null);
  
  // Deterministic 3D Head Render Control Parameters
  const [hairLength, setHairLength] = useState(45); // 0 (Bald/Fade) to 100 (Long flow)
  const [fadeType, setFadeType] = useState('skin_taper'); // skin_taper | drop_fade | burst_fade | classic
  const [beardLength, setBeardLength] = useState(20); // 0 (Clean shaved) to 100 (Full beard)
  const [hairColor, setHairColor] = useState('#27272a'); // Charcoal, Blonde, Auburn, Silver
  const [rotationAngle, setRotationAngle] = useState(25);
  const [lightingMode, setLightingMode] = useState('studio');
  const [meshWireframe, setMeshWireframe] = useState(false);

  // Canvas WebGL 2D/3D Hybrid Renderer Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2 + 10;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Background Studio Ambient Glow
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 180);
      bgGlow.addColorStop(0, lightingMode === 'studio' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.12)');
      bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Studio Grid Background Lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      // Interactive 3D Rotation transform
      const rad = (rotationAngle * Math.PI) / 180;
      const scaleX = Math.cos(rad);

      // 1. Neck & Shoulders Base
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0 * scaleX, 100, 75 * Math.abs(scaleX) + 10, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Head/Skull Oval Base
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(0 * scaleX, -10, 55 * Math.abs(scaleX) + 5, 75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = meshWireframe ? 1.5 : 2;
      ctx.stroke();

      // 3. Ear Anatomy
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse((-52 * scaleX), 0, 8, 16, 0, 0, Math.PI * 2);
      ctx.ellipse((52 * scaleX), 0, 8, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Facial Feature Guidelines (Eyes & Nose orientation)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      const eyeOffsetX = 20 * scaleX;
      ctx.beginPath();
      // Eyes
      ctx.arc(eyeOffsetX - (15 * scaleX), -15, 4, 0, Math.PI * 2);
      ctx.arc(eyeOffsetX + (15 * scaleX), -15, 4, 0, Math.PI * 2);
      ctx.stroke();
      // Nose
      ctx.beginPath();
      ctx.moveTo(eyeOffsetX, -10);
      ctx.lineTo(eyeOffsetX + (4 * scaleX), 10);
      ctx.lineTo(eyeOffsetX - (4 * scaleX), 15);
      ctx.stroke();

      // 5. Dynamic Beard Render Engine
      if (beardLength > 5) {
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        const beardHeight = Math.min(50, beardLength * 0.5);
        ctx.moveTo(-45 * scaleX, 10);
        ctx.quadraticCurveTo(0, 35 + beardHeight, 45 * scaleX, 10);
        ctx.quadraticCurveTo(0, 70 + beardHeight, -45 * scaleX, 10);
        ctx.fill();
        if (meshWireframe) {
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
        }
      }

      // 6. Dynamic Hair/Cut Render Engine based on sliders
      if (hairLength > 2) {
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        const hairTopHeight = Math.min(65, hairLength * 0.6);
        ctx.moveTo(-56 * scaleX, -20);
        ctx.quadraticCurveTo(0, -85 - hairTopHeight, 56 * scaleX, -20);

        if (fadeType === 'skin_taper') {
          ctx.quadraticCurveTo(35 * scaleX, -40, 0, -25);
          ctx.quadraticCurveTo(-35 * scaleX, -40, -56 * scaleX, -20);
        } else if (fadeType === 'drop_fade') {
          ctx.quadraticCurveTo(45 * scaleX, -10, 0, -15);
          ctx.quadraticCurveTo(-45 * scaleX, -10, -56 * scaleX, -20);
        } else {
          ctx.quadraticCurveTo(0, 10, -56 * scaleX, -20);
        }
        ctx.fill();

        if (meshWireframe) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.restore();

      // Render Lighting Specs overlay
      ctx.fillStyle = lightingMode === 'studio' ? '#fbbf24' : '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`3D WIREFRAME MESH: ${meshWireframe ? 'ENABLED' : 'DISABLED'} | LIGHTING: ${lightingMode.toUpperCase()}`, 15, 25);
      ctx.fillText(`ROTATION: ${rotationAngle}° | HAIR LENGTH: ${hairLength}mm | BEARD: ${beardLength}mm`, 15, 40);
    };

    render();
  }, [hairLength, fadeType, beardLength, hairColor, rotationAngle, lightingMode, meshWireframe]);

  const handleSavePreset = () => {
    const presetData = {
      hairLength,
      fadeType,
      beardLength,
      hairColor,
      rotationAngle,
      presetName: `${fadeType.replace('_', ' ').toUpperCase()} (${hairLength}mm Hair / ${beardLength}mm Beard)`
    };
    if (onApplyPreset) onApplyPreset(presetData);
    toast.success(`Attached 3D Style Model Preset "${presetData.presetName}" to your booking requirement!`, '3D Model Attached');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>WebGL 3D Interactive Hair & Cut Builder (#1)</span>
          </span>
          <h3 className="text-lg font-black text-white mt-0.5">3D Sculpt & Cut Parameter Engine</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMeshWireframe(!meshWireframe)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              meshWireframe ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {meshWireframe ? 'Wireframe Mesh ON' : 'Solid Mesh'}
          </button>
          <button
            type="button"
            onClick={() => setLightingMode(lightingMode === 'studio' ? 'cyber' : 'studio')}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold hover:text-white"
          >
            Light: {lightingMode.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* WebGL Canvas Visual Stage */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={440}
            height={320}
            className="w-full h-auto max-w-full rounded-xl cursor-grab active:cursor-grabbing"
          />

          {/* Interactive Rotation Bar */}
          <div className="w-full mt-3 flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Rotate 3D Head</span>
            </span>
            <input
              type="range"
              min="-60"
              max="60"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              className="w-48 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-amber-400 font-bold">{rotationAngle}°</span>
          </div>
        </div>

        {/* Sculpting Parameters Control Panel */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Sculpting Parameters</span>
          </h4>

          {/* Hair Length Slider */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-200">Hair Top Length</span>
              <span className="font-mono text-amber-400 font-bold">{hairLength} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={hairLength}
              onChange={(e) => setHairLength(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Fade Type Selector */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="text-xs font-extrabold text-slate-200 block">Sides Fade Topology</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'skin_taper', label: 'Skin Taper' },
                { id: 'drop_fade', label: 'Low Drop Fade' },
                { id: 'burst_fade', label: 'Burst Fade' },
                { id: 'classic', label: 'Classic Scissors' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFadeType(f.id)}
                  className={`py-1.5 px-2.5 rounded-xl font-bold text-left transition-all border ${
                    fadeType === f.id
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Beard Length Slider */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-200">Beard & Facial Grooming</span>
              <span className="font-mono text-amber-400 font-bold">{beardLength} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={beardLength}
              onChange={(e) => setBeardLength(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Hair Color Palette */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="text-xs font-extrabold text-slate-200 block">Hair Tone & Dye</span>
            <div className="flex items-center gap-2">
              {[
                { name: 'Natural Black', color: '#18181b' },
                { name: 'Dark Brown', color: '#451a03' },
                { name: 'Honey Blonde', color: '#d97706' },
                { name: 'Platinum Silver', color: '#cbd5e1' },
                { name: 'Burgundy', color: '#881337' }
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setHairColor(c.color)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    hairColor === c.color ? 'scale-125 border-amber-400 ring-2 ring-amber-500/30' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={handleSavePreset}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Scissors className="w-4 h-4 stroke-[2.5]" />
            <span>Attach 3D Cut Model to Booking</span>
          </button>
        </div>
      </div>
    </div>
  );
}
