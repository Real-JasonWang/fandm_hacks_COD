import React, { useRef, useEffect } from 'react';
import type { Dorm, RestroomNode, DormId } from '../types';

interface CampusMapProps {
  dorms: Dorm[];
  restrooms: RestroomNode[];
  selectedNode: RestroomNode | null;
  onSelectNode: (node: RestroomNode) => void;
  activeVector: { fromDormId: DormId; toNodeId: string; progress: number } | null;
  custodialMode: boolean;
}

// Coordinate mapping for F&M campus landmarks
const FM_BUILDINGS = [
  { id: 'old_main', name: 'Old Main & Chapel', x: 50, y: 56, w: 10, h: 6, color: '#272A34', label: 'Old Main' },
  { id: 'shadek_lib', name: 'Shadek Library', x: 50, y: 50, w: 9, h: 5, color: '#1E293B', label: 'Shadek Lib' },
  { id: 'steinman_ctr', name: 'Steinman College Ctr', x: 62, y: 65, w: 11, h: 7, color: '#1E293B', label: 'Steinman Ctr' },
  { id: 'hackman_labs', name: 'Hackman Science Labs', x: 44, y: 35, w: 8, h: 6, color: '#1E293B', label: 'Hackman' },
  { id: 'barshinger_lsb', name: 'Barshinger LSB', x: 35, y: 40, w: 9, h: 5, color: '#1E293B', label: 'Life Sciences' },
  { id: 'stager_hall', name: 'Stager Hall', x: 42, y: 62, w: 7, h: 5, color: '#1E293B', label: 'Stager' },
  { id: 'asfc_athletics', name: 'ASFC Fitness Center', x: 68, y: 20, w: 14, h: 8, color: '#1E293B', label: 'ASFC Gym' },
  // Residential College Houses
  { id: 'bonchek_house', name: 'Bonchek House (Hartman)', x: 48, y: 28, w: 8, h: 5, color: '#0E3A4F', dormId: 'bonchek', label: 'Bonchek House' },
  { id: 'brooks_house', name: 'Brooks House', x: 52, y: 42, w: 8, h: 5, color: '#4C1021', dormId: 'brooks', label: 'Brooks House' },
  { id: 'ware_house', name: 'Ware House', x: 32, y: 52, w: 8, h: 5, color: '#0A3B2A', dormId: 'ware', label: 'Ware House' },
  { id: 'weis_house', name: 'Weis House', x: 38, y: 70, w: 8, h: 5, color: '#2C1B4D', dormId: 'weis', label: 'Weis House' },
  { id: 'college_row', name: 'College Row / New House', x: 74, y: 35, w: 10, h: 6, color: '#4A3205', dormId: 'new_college', label: 'College Row' },
];

export const CampusMap: React.FC<CampusMapProps> = ({
  dorms,
  restrooms,
  selectedNode,
  onSelectNode,
  activeVector,
  custodialMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Dark charcoal canvas background (#0B0C10)
      ctx.fillStyle = custodialMode ? '#0F1117' : '#0B0C10';
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle campus grid lines
      ctx.strokeStyle = custodialMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. F&M Walkways & Roads (Matte dark ribbon #1C1E24)
      ctx.strokeStyle = '#181A20';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const paths = [
        [[50, 20], [50, 80]], // Main north-south spine
        [[30, 50], [75, 50]], // Library cross-walkway
        [[48, 28], [68, 20]], // Bonchek to ASFC
        [[32, 52], [50, 56]], // Ware to Old Main
        [[38, 70], [62, 65]], // Weis to Steinman
        [[62, 65], [74, 35]], // Steinman to College Row
      ];
      paths.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo((p[0][0] / 100) * width, (p[0][1] / 100) * height);
        for (let i = 1; i < p.length; i++) {
          ctx.lineTo((p[i][0] / 100) * width, (p[i][1] / 100) * height);
        }
        ctx.stroke();
      });

      // 4. Subtle Voronoi Territory Shading (Dorm Faction Control)
      if (!custodialMode) {
        dorms.forEach((d) => {
          const dormBuilding = FM_BUILDINGS.find((b) => b.dormId === d.id);
          if (dormBuilding) {
            const bx = (dormBuilding.x / 100) * width;
            const by = (dormBuilding.y / 100) * height;
            const radius = 100 + Math.sin(t + d.residentCount) * 8; // subtle breathing tension
            const grad = ctx.createRadialGradient(bx, by, 10, bx, by, radius);
            grad.addColorStop(0, `${d.colorHex}22`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 5. 3D Extruded Buildings (Matte charcoal geometry with isometric depth)
      FM_BUILDINGS.forEach((b) => {
        const bx = (b.x / 100) * width;
        const by = (b.y / 100) * height;
        const bw = (b.w / 100) * width;
        const bh = (b.h / 100) * height;
        const depth = 8; // isometric extrusion

        // Extrusion shadow side
        ctx.fillStyle = '#101216';
        ctx.beginPath();
        ctx.moveTo(bx + bw, by);
        ctx.lineTo(bx + bw + depth, by - depth);
        ctx.lineTo(bx + bw + depth, by + bh - depth);
        ctx.lineTo(bx + bw, by + bh);
        ctx.closePath();
        ctx.fill();

        // Extrusion top side
        ctx.fillStyle = '#171920';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + depth, by - depth);
        ctx.lineTo(bx + bw + depth, by - depth);
        ctx.lineTo(bx + bw, by);
        ctx.closePath();
        ctx.fill();

        // Front Face
        ctx.fillStyle = b.color;
        ctx.fillRect(bx, by, bw, bh);

        // Subtle 1px border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        // Building Label
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, bx + bw / 2, by + bh / 2 + 3);
      });

      // 6. Active Vector Dash Battle Line (#FFE600 Marching Ants)
      if (activeVector && !custodialMode) {
        const fromDorm = FM_BUILDINGS.find((b) => b.dormId === activeVector.fromDormId);
        const toNode = restrooms.find((r) => r.id === activeVector.toNodeId);
        if (fromDorm && toNode) {
          const sx = (fromDorm.x / 100) * width;
          const sy = (fromDorm.y / 100) * height;
          const tx = (toNode.x / 100) * width;
          const ty = (toNode.y / 100) * height;

          const cx = sx + (tx - sx) * activeVector.progress;
          const cy = sy + (ty - sy) * activeVector.progress;

          // Glowing active vector line
          ctx.strokeStyle = '#FFE600';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.lineDashOffset = -t * 20; // moving ants effect
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.setLineDash([]);

          // Vector head spark
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Restroom Node Pins (Action Yellow or Amber Custodial Glow)
      restrooms.forEach((r) => {
        const rx = (r.x / 100) * width;
        const ry = (r.y / 100) * height;
        const isSelected = selectedNode?.id === r.id;
        const controllingDorm = dorms.find((d) => d.id === r.controllingDormId);

        if (custodialMode) {
          // Custodial Heatmap Visuals
          const urgencyColor = r.soilingIndex >= 3 ? '#F59E0B' : r.soilingIndex >= 1 ? '#D97706' : '#334155';
          const pulse = r.soilingIndex >= 3 ? Math.sin(t * 4) * 4 : 0;

          // Amber halo
          ctx.fillStyle = r.soilingIndex >= 3 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.1)';
          ctx.beginPath();
          ctx.arc(rx, ry, 14 + pulse, 0, Math.PI * 2);
          ctx.fill();

          // Core pin
          ctx.fillStyle = urgencyColor;
          ctx.beginPath();
          ctx.arc(rx, ry, 7, 0, Math.PI * 2);
          ctx.fill();

          // Toilet icon / label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`U:${r.soilingIndex}`, rx, ry + 16);
        } else {
          // Student Faction Battle Mode
          const pinColor = controllingDorm ? controllingDorm.colorHex : '#64748B';

          // Selection ring
          if (isSelected) {
            ctx.strokeStyle = '#FFE600';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(rx, ry, 12, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Pin Base
          ctx.fillStyle = pinColor;
          ctx.beginPath();
          ctx.arc(rx, ry, isSelected ? 7 : 5, 0, Math.PI * 2);
          ctx.fill();

          // 1px white border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Mini HP Bar over node
          const barW = 18;
          const barH = 3;
          ctx.fillStyle = '#0B0C10';
          ctx.fillRect(rx - barW / 2, ry - 10, barW, barH);
          ctx.fillStyle = r.baseHp > 40 ? '#10B981' : '#EF4444';
          ctx.fillRect(rx - barW / 2, ry - 10, (r.baseHp / 100) * barW, barH);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dorms, restrooms, selectedNode, activeVector, custodialMode]);

  // Click on canvas to select restroom node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Find closest restroom within 5% distance
    let closestNode: RestroomNode | null = null;
    let minDist = 6;
    restrooms.forEach((r) => {
      const dist = Math.hypot(r.x - clickX, r.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        closestNode = r;
      }
    });

    if (closestNode) {
      onSelectNode(closestNode);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0B0C10]">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair touch-none"
      />
      {/* Subtle compass coordinate tag */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#16171B]/80 backdrop-blur border border-white/5 text-[10px] font-mono text-[#64748B]">
        F&M 40.0475° N, 76.3195° W
      </div>
    </div>
  );
};
