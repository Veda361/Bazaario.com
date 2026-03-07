import { useState } from "react";

const FloatingHeroProduct = ({ image }) => {
  const [style, setStyle] = useState({});

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 25;
    const rotateY = (x - centerX) / 25;

    setStyle({
      transform: `
        perspective(1600px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(40px)
        scale(1.05)
      `,
    });
  };

  const reset = () => {
    setStyle({
      transform: "perspective(1600px) rotateX(0deg) rotateY(0deg)",
    });
  };

  return (
    <div
      className="flex items-center justify-center w-full h-[500px]"
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      <img
        src={image}
        style={style}
        className="h-[420px] object-contain transition-transform duration-200
                   drop-shadow-[0_60px_80px_rgba(0,0,0,0.7)]"
      />
    </div>
  );
};

export default FloatingHeroProduct;