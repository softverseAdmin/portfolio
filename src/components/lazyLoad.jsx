"use client"

import { motion } from "framer-motion";

const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => {
      const delay = i * 0.5;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring", duration: 1, bounce: 0 },
          opacity: { delay, duration: 0.01 },
        },
      };
    },
  };
  
  const image = {
    maxWidth: "100vw",
  };
  
  const shape = {
    strokeWidth: 9,
    strokeLinecap: "round", 
    fill: "transparent",
  };
  

export default function LazyLoad() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center justify-center gap-8">
        <motion.svg 
          width="300" 
          height="300" 
          viewBox="0 0 402 409" 
          xmlns="http://www.w3.org/2000/svg"
          initial="hidden"
          animate="visible"
          style={image}
        >
          <motion.path 
            d="M170.498 183.711L261.744 183.891L400.523 408.755L1.05949 407.965L170.498 183.711Z" 
            fill="url(#paint0_linear_1_321)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
          />
          <motion.path 
            d="M236.736 128.881L236.692 134.843L243.626 134.872L243.679 128.918L236.736 128.881ZM197.506 128.67L190.561 128.632L190.528 134.586L197.461 134.632L197.506 128.67ZM230.041 95.1572L229.792 128.844L243.679 128.918L243.928 95.2321L230.041 95.1572ZM236.78 122.919L197.549 122.707L197.461 134.632L236.692 134.843L236.78 122.919ZM204.449 128.707L204.697 95.0208L190.81 94.9458L190.561 128.632L204.449 128.707ZM217.449 84.2085C220.81 84.2279 224.023 85.3919 226.384 87.445C228.745 89.498 230.06 92.2722 230.041 95.1572L243.928 95.2321C243.951 92.2369 243.288 89.2675 241.974 86.4927C240.66 83.718 238.723 81.1926 236.272 79.0613C233.821 76.9305 230.904 75.2347 227.69 74.0717C224.475 72.9087 221.026 72.3011 217.538 72.2835L217.449 84.2085ZM217.538 72.2835C214.049 72.2633 210.591 72.8338 207.359 73.9621C204.128 75.0904 201.187 76.7542 198.705 78.8589C196.222 80.9636 194.248 83.4674 192.893 86.2277C191.539 88.988 190.831 91.9507 190.81 94.9458L204.697 95.0208C204.72 92.1354 206.077 89.3761 208.468 87.3483C210.859 85.321 214.089 84.1917 217.449 84.2085L217.538 72.2835ZM219.842 122.836L214.487 122.807L214.399 134.715L219.754 134.744L219.842 122.836ZM160.536 184.955L272.872 185.561L272.96 173.653L160.624 173.048L160.536 184.955ZM272.872 185.561C278.168 185.59 282.511 181.907 282.544 177.36L268.676 177.285C268.684 176.316 269.14 175.389 269.943 174.708C270.746 174.026 271.831 173.647 272.96 173.653L272.872 185.561ZM150.985 176.65C150.952 181.198 155.239 184.927 160.536 184.955L160.624 173.048C162.977 173.06 164.868 174.704 164.853 176.725L150.985 176.65ZM214.487 122.807C197.752 122.718 181.66 128.341 169.752 138.438C157.843 148.535 151.093 162.28 150.985 176.65L164.853 176.725C164.937 165.513 170.204 154.789 179.495 146.91C188.787 139.032 201.342 134.645 214.399 134.715L214.487 122.807ZM219.754 134.744C232.812 134.815 245.301 139.337 254.475 147.314C263.65 155.293 268.758 166.073 268.676 177.285L282.544 177.36C282.648 162.99 276.101 149.173 264.343 138.948C252.584 128.723 236.577 122.927 219.842 122.836L219.754 134.744Z"
            stroke="white"
            variants={draw}
            custom={2}
            style={shape}
          />
          <motion.path 
            d="M217.667 0.0484619L217.475 73.5502" 
            stroke="white"
            variants={draw}
            custom={3}
            style={shape}
          />
          <defs>
            <linearGradient id="paint0_linear_1_321" x1="188.034" y1="183.745" x2="187.59" y2="408.334" gradientUnits="userSpaceOnUse">
              <stop stopColor="white"/>
              <stop offset="1" stopColor="#C4C4C4" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </motion.svg>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <div className="text-4xl font-bold text-white">RABIN ADHIKARI</div>
          <div className="text-lg text-gray-400">Loading...</div>
        </motion.div>
      </div>
    </div>
  );
}