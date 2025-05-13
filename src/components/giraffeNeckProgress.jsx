import React from "react";
import { BadgeCheck, Lock } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// Define the categories that each giraffe neck will represent
const NECK_CATEGORIES = ["Self", "Career", "Emotions"];

export default function GiraffeNeckProgress({ insights = [] }) {
  // Group insights by category and sort them by salience within each category
  const categorizedInsights = NECK_CATEGORIES.map((category) => {
    const filtered = insights
      .filter((node) => node.category === category)
      .sort((a, b) => b.emotionalSalience - a.emotionalSalience); // Highest salience at top

    return { category, insights: filtered };
  });

  return (
    <Swiper spaceBetween={50} slidesPerView={1} className="px-4 py-6">
      {/* Each category becomes a swipeable page */}
      {categorizedInsights.map(({ category, insights }) => (
        <SwiperSlide key={category}>
          <div className="flex flex-col items-center space-y-4 relative">
            {/* Category label and giraffe emoji */}
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              {category} 🦒
            </h3>

            {/* Vertical neck container to visualize insight nodes */}
            <div className="relative h-[500px] w-12 bg-yellow-100 rounded-full shadow-inner">
              {insights.map((node, idx) => (
                // Each node represented by a circular badge positioned along the neck
                <div
                  key={node.id || idx}
                  className={`absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all cursor-pointer ${
                    node.visibility === "locked"
                      ? "bg-gray-400"
                      : node.status === "confirmed"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ top: `${(idx / insights.length) * 90}%` }} // Position based on index
                  title={node.visibility === "locked" ? "Locked Insight" : node.label}
                >
                  {/* Icon shows lock or confirmation badge based on visibility */}
                  {node.visibility === "locked" ? <Lock size={18} /> : <BadgeCheck size={18} />}
                </div>
              ))}
            </div>

            {/* Display count of insights for each category */}
            <p className="text-sm text-gray-500">{insights.length} insights</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}