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

// Detailed F&M Campus Architectural Geo-Objects
interface BuildingDef {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  levels: number;
  facadeColor: string;
  roofColor: string;
  label: string;
  dormId?: DormId;
  isHistoric?: boolean;
}

const FM_BUILDINGS: BuildingDef[] = [
  // Historic Core
  { id: 'old_main', name: 'Old Main & Chapel Spire', x: 48, y: 54, w: 12, h: 7, levels: 4, facadeColor: '#3F4450', roofColor: '#2D313B', label: 'Old Main Spire', isHistoric: true },
  { id: 'shadek_lib', name: 'Shadek-Fackenthal Library', x: 49, y: 46, w: 10, h: 6, levels: 3, facadeColor: '#2B3240', roofColor: '#1E2530', label: 'Shadek Library' },
  { id: 'steinman_ctr', name: 'Steinman College Center', x: 63, y: 64, w: 12, h: 8, levels: 3, facadeColor: '#363942', roofColor: '#25272F', label: 'Steinman Dining' },
  
  // Science & Research Hub
  { id: 'hackman_labs', name: 'Hackman Science Labs', x: 43, y: 34, w: 9, h: 7, levels: 4, facadeColor: '#283344', roofColor: '#1C2432', label: 'Hackman Labs' },
  { id: 'barshinger_lsb', name: 'Barshinger Life Sciences', x: 33, y: 39, w: 10, h: 6, levels: 3, facadeColor: '#2A3642', roofColor: '#1D2731', label: 'Barshinger LSB' },
  { id: 'stager_hall', name: 'Stager Hall', x: 40, y: 64, w: 8, h: 5, levels: 3, facadeColor: '#38332E', roofColor: '#26221E', label: 'Stager Hall' },
  { id: 'keiper_hall', name: 'Keiper Hall', x: 33, y: 66, w: 7, h: 5, levels: 3, facadeColor: '#38332E', roofColor: '#26221E', label: 'Keiper Hall' },
  { id: 'asfc_athletics', name: 'Alumni Sports & Fitness', x: 68, y: 18, w: 15, h: 9, levels: 2, facadeColor: '#2D343F', roofColor: '#1F242D', label: 'ASFC Gym Complex' },

  // The 5 F&M College Houses (Residential Quads)
  { id: 'bonchek_house', name: 'Bonchek House (Hartman)', x: 48, y: 26, w: 9, h: 6, levels: 4, facadeColor: '#0C4A6E', roofColor: '#07273B', label: 'Bonchek House', dormId: 'bonchek' },
  { id: 'brooks_house', name: 'Brooks College House', x: 53, y: 40, w: 9, h: 5, levels: 4, facadeColor: '#881337', roofColor: '#4C0519', label: 'Brooks House', dormId: 'brooks' },
  { id: 'ware_house', name: 'Ware College House', x: 29, y: 51, w: 9, h: 6, levels: 4, facadeColor: '#064E3B', roofColor: '#022C22', label: 'Ware House', dormId: 'ware' },
  { id: 'weis_house', name: 'Weis College House', x: 37, y: 73, w: 9, h: 6, levels: 4, facadeColor: '#4C1D95', roofColor: '#2E1065', label: 'Weis House', dormId: 'weis' },
  { id: 'college_row', name: 'New College House / Row', x: 74, y: 34, w: 11, h: 7, levels: 4, facadeColor: '#78350F', roofColor: '#451A03', label: 'College Row', dormId: 'new_college' },
];

// Campus Quads (Lawn Green Polygons)
const FM_QUADS = [
  { name: 'Hartman Quad', x: 47, y: 24, w: 13, h: 10, color: '#0C1E14' },
  { name: 'Brooks Quad', x: 51, y: 38, w: 14, h: 10, color: '#0D2015' },
  { name: 'Old Main Lawn', x: 46, y: 51, w: 16, h: 14, color: '#0F2619' },
  { name: 'Ware West Commons', x: 27, y: 48, w: 14, h: 12, color: '#0B1D13' },
  { name: 'Weis East Greens', x: 35, y: 70, w: 14, h: 12, color: '#0C1E14' },
  { name: 'Harrisburg Greenbelt', x: 65, y: 16, w: 22, h: 14, color: '#0D2216' },
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
      t += 0.025;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Dark charcoal canvas background (#0B0C10)
      ctx.fillStyle = custodialMode ? '#0B0D13' : '#0B0C10';
      ctx.fillRect(0, 0, width, height);

      // 2. F&M Campus Quad Lawns (Subtle deep matte grass patches)
      FM_QUADS.forEach((q) => {
        const qx = (q.x / 100) * width;
        const qy = (q.y / 100) * height;
        const qw = (q.w / 100) * width;
        const qh = (q.h / 100) * height;

        ctx.fillStyle = custodialMode ? '#10131B' : q.color;
        ctx.beginPath();
        ctx.roundRect(qx, qy, qw, qh, 8);
        ctx.fill();

        // Delicate inner border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 3. F&M Campus Walkway Network (A* connected paths)
      const pathways = [
        [[50, 16], [50, 84]], // North-South Old Main Spine
        [[26, 52], [78, 52]], // East-West Library Cross-Campus
        [[48, 27], [68, 19]], // Hartman to ASFC
        [[30, 52], [50, 56]], // Ware to Old Main
        [[38, 73], [63, 65]], // Weis to Steinman Center
        [[63, 65], [75, 36]], // Steinman to College Row
        [[43, 35], [50, 46]], // Hackman to Shadek
        [[33, 40], [43, 35]], // Barshinger LSB to Hackman
        [[40, 64], [50, 56]], // Stager to Old Main
      ];

      pathways.forEach((path) => {
        const sx = (path[0][0] / 100) * width;
        const sy = (path[0][1] / 100) * height;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo((path[i][0] / 100) * width, (path[i][1] / 100) * height);
        }
        // Pathway pavement
        ctx.strokeStyle = '#181B22';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Subtle walkway centerline
        ctx.strokeStyle = '#222630';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 4. Street Name Road Labels
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('COLLEGE AVE ───►', 20, height - 14);
      ctx.fillText('▲ HARRISBURG AVE', width - 110, 24);

      // 5. Dynamic Voronoi Territory Pulsing Fields
      if (!custodialMode) {
        dorms.forEach((d) => {
          const dormBuilding = FM_BUILDINGS.find((b) => b.dormId === d.id);
          if (dormBuilding) {
            const bx = (dormBuilding.x / 100) * width;
            const by = (dormBuilding.y / 100) * height;
            const pulse = Math.sin(t * 1.5 + d.residentCount) * 10;
            const radius = 95 + (d.territoryPercentage * 2.2) + pulse;

            const grad = ctx.createRadialGradient(bx, by, 15, bx, by, radius);
            grad.addColorStop(0, `${d.colorHex}28`);
            grad.addColorStop(0.6, `${d.colorHex}0C`);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fill();

            // Dynamic Frontline clash border
            ctx.strokeStyle = `${d.colorHex}40`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.arc(bx, by, radius - 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // 6. 3D Extruded Campus Buildings (Isometric Architectural Shading)
      FM_BUILDINGS.forEach((b) => {
        const bx = (b.x / 100) * width;
        const by = (b.y / 100) * height;
        const bw = (b.w / 100) * width;
        const bh = (b.h / 100) * height;
        const depth = b.levels * 3.5;

        // Ground drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2 + 4, by + bh + 4, bw * 0.65, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right extrusion wall (Dark side)
        ctx.fillStyle = '#0F1218';
        ctx.beginPath();
        ctx.moveTo(bx + bw, by);
        ctx.lineTo(bx + bw + depth, by - depth);
        ctx.lineTo(bx + bw + depth, by + bh - depth);
        ctx.lineTo(bx + bw, by + bh);
        ctx.closePath();
        ctx.fill();

        // Top extrusion roof (Light roof deck)
        ctx.fillStyle = b.roofColor;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + depth, by - depth);
        ctx.lineTo(bx + bw + depth, by - depth);
        ctx.lineTo(bx + bw, by);
        ctx.closePath();
        ctx.fill();

        // Roof border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Front Facade
        ctx.fillStyle = b.facadeColor;
        ctx.fillRect(bx, by, bw, bh);

        // Architectural window rows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        const winCols = 4;
        const winRows = Math.max(1, b.levels - 1);
        const colW = bw / (winCols + 1);
        const rowH = bh / (winRows + 1);
        for (let r = 1; r <= winRows; r++) {
          for (let c = 1; c <= winCols; c++) {
            ctx.fillRect(bx + c * colW - 2, by + r * rowH - 1.5, 3.5, 3);
          }
        }

        // Historic Spire on Old Main
        if (b.isHistoric) {
          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.arc(bx + bw / 2 + depth, by - depth - 4, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Building Label Tag
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 9px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, bx + bw / 2, by + bh / 2 + 3);
      });

      // 7. Active Vector Dash Battle Line (#FFE600 Marching Ants)
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

          // Glowing energetic yellow vector line
          ctx.strokeStyle = '#FFE600';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#FFE600';
          ctx.shadowBlur = 8;
          ctx.setLineDash([10, 5]);
          ctx.lineDashOffset = -t * 28;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          // Vector head energy spark
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 8. Restroom Nodes (Tactical Pins & Amber Custodial Halos)
      restrooms.forEach((r) => {
        const rx = (r.x / 100) * width;
        const ry = (r.y / 100) * height;
        const isSelected = selectedNode?.id === r.id;
        const controllingDorm = dorms.find((d) => d.id === r.controllingDormId);

        if (custodialMode) {
          // Custodial Mode: Amber Glow according to Urgency
          const urgencyColor = r.soilingIndex >= 3 ? '#F59E0B' : r.soilingIndex >= 1 ? '#D97706' : '#334155';
          const pulse = r.soilingIndex >= 3 ? Math.sin(t * 5) * 5 : 0;

          // Amber urgency halo
          ctx.fillStyle = r.soilingIndex >= 3 ? 'rgba(245, 158, 11, 0.28)' : 'rgba(217, 119, 6, 0.12)';
          ctx.beginPath();
          ctx.arc(rx, ry, 16 + pulse, 0, Math.PI * 2);
          ctx.fill();

          // Core pin
          ctx.fillStyle = urgencyColor;
          ctx.beginPath();
          ctx.arc(rx, ry, 7.5, 0, Math.PI * 2);
          ctx.fill();

          // Border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Urgency text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`U:${r.soilingIndex}`, rx, ry + 18);
        } else {
          // Student Faction Mode: Gradual Territory Expansion & Influence Waves
          const pinColor = controllingDorm ? controllingDorm.colorHex : '#64748B';

          // Gradual territory influence aura
          const dynamicRad = (r.influenceRadius || 25) + Math.sin(t * 3 + r.floor) * 3;
          ctx.save();
          ctx.fillStyle = pinColor + '20'; // 12% opacity
          ctx.beginPath();
          ctx.arc(rx, ry, dynamicRad, 0, Math.PI * 2);
          ctx.fill();

          // Contested state animated dashed alert ring
          if (r.contestState === 'CONTESTED') {
            ctx.strokeStyle = '#FFE600';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.lineDashOffset = t * 15;
            ctx.beginPath();
            ctx.arc(rx, ry, dynamicRad + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.restore();

          // Selection Reticle
          if (isSelected) {
            ctx.strokeStyle = '#FFE600';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(rx, ry, 14, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Pin Body
          ctx.fillStyle = pinColor;
          ctx.beginPath();
          ctx.arc(rx, ry, isSelected ? 8 : 6, 0, Math.PI * 2);
          ctx.fill();

          // 1.5px white border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Gradual capture progression meter
          const barW = 24;
          const barH = 3;
          ctx.fillStyle = '#0B0C10';
          ctx.fillRect(rx - barW / 2, ry - 12, barW, barH);
          ctx.fillStyle = r.baseHp > 40 ? '#10B981' : '#EF4444';
          ctx.fillRect(rx - barW / 2, ry - 12, (r.baseHp / 100) * barW, barH);

          // Gradual progress indicator text
          if (isSelected) {
            ctx.fillStyle = '#FFE600';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${r.captureProgress ?? r.baseHp}%`, rx, ry - 15);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dorms, restrooms, selectedNode, activeVector, custodialMode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    let closestNode: RestroomNode | null = null;
    let minDist = 7;
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
        width={960}
        height={720}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair touch-none"
      />
      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#16171B]/85 backdrop-blur border border-white/10 text-[10px] font-mono text-[#94A3B8] shadow-md">
        F&M Main Campus · 40.0475° N, 76.3195° W
      </div>
    </div>
  );
};
