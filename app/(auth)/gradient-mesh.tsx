export function GradientMesh() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center overflow-hidden">
      <svg
        className="h-[640px] w-full shrink-0 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="mesh-blur" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>
        <g filter="url(#mesh-blur)" transform="translate(0 40) skewY(-8)">
          <ellipse cx="140" cy="380" rx="340" ry="150" fill="#f5e9d4" />
          <ellipse cx="460" cy="350" rx="300" ry="140" fill="#ffb27d" />
          <ellipse cx="760" cy="360" rx="310" ry="150" fill="#b9b9f9" />
          <ellipse cx="1050" cy="330" rx="290" ry="140" fill="#533afd" />
          <ellipse cx="1330" cy="350" rx="270" ry="145" fill="#ea2261" />
          <ellipse cx="1200" cy="250" rx="190" ry="95" fill="#f96bee" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
