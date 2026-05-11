export function LeafDecoration() {
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-[210px] opacity-70 sm:w-[270px] xl:w-[330px]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M205 552 C194 452 176 365 167 283 C157 188 170 92 212 10"
          stroke="#8b5cf6"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.16"
        />
        {[
          ["210", "70", "-24", "22", "70", "0.15"],
          ["168", "122", "32", "20", "64", "0.12"],
          ["226", "175", "-36", "24", "82", "0.14"],
          ["146", "232", "25", "23", "76", "0.13"],
          ["236", "290", "-28", "26", "88", "0.13"],
          ["158", "360", "34", "23", "78", "0.12"],
          ["246", "430", "-22", "25", "82", "0.11"],
        ].map(([cx, cy, rotate, rx, ry, opacity]) => (
          <ellipse
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            transform={`rotate(${rotate} ${cx} ${cy})`}
            fill="#a78bfa"
            opacity={opacity}
          />
        ))}
        <path d="M188 142 C155 122 126 100 98 74" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity=".11" />
        <path d="M176 266 C134 238 104 215 78 182" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity=".10" />
        <path d="M184 386 C145 362 116 338 90 306" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity=".09" />
      </svg>
    </div>
  );
}
