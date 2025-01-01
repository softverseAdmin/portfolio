import React, { useRef, useEffect, useState } from 'react';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(0.01);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;

    const shapes = [];
    const numShapes = 8000;
    const zCenter = 2000;
    const radius = 1200;
    let variator = -h * 2;

    for (let i = 0; i < numShapes; i++) {
      const r = Math.random();
      const col = `rgba(255,255,255,${r})`;
      const s = {
        y: Math.random() * h * 12 - h * 6,
        angle: (Math.PI * 2) * i / (numShapes / 17),
        c: col,
        radius: Math.random() * 50,
        random: Math.random() * w / 2 - w / 4,
        x: 0,
        z: 0
      };
      s.x = s.random + Math.sin(s.angle) * radius;
      s.z = zCenter + Math.cos(s.angle) * radius;
      shapes.push(s);

      variator += 10;
    }

    const fl = 300;

    context.translate(w / 2, h / 2);

    const update = () => {
      shapes.sort((p1, p2) => p2.z - p1.z);
      context.fillStyle = 'rgba(0,0,0,1)';
      context.fillRect(-w / 2, -h / 2, w, h);

      for (let i = 0; i < shapes.length; i++) {
        const perspective = fl / (fl + shapes[i].z);

        context.save();

        context.fillStyle = shapes[i].c;

        context.scale(perspective, perspective);
        context.translate(shapes[i].x, shapes[i].y);

        context.beginPath();
        context.arc(shapes[i].x, shapes[i].y, shapes[i].radius, 0, Math.PI * 2);
        context.fill();

        context.restore();

        shapes[i].angle += speed;
        shapes[i].x = shapes[i].random + Math.sin(shapes[i].angle) * radius;
        shapes[i].z = zCenter + Math.cos(shapes[i].angle) * radius;
      }

      requestAnimationFrame(update);
    };

    update();

    const handleMouseMove = (event) => {
      setSpeed((event.clientX - w / 2) * 0.00005);
    };

    document.body.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
    };
  }, [speed]);

  return (
    <div className="min-h-screen flex items-center justify-center" id="background-section">
      <canvas
        ref={canvasRef}
        style={{
          display: 'flex', 
          position: 'absolute',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
        }}
      />
    </div>
  );
};

export default BackgroundAnimation;