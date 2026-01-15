"use client"

import { motion } from "framer-motion"
import { Users, Clock } from "lucide-react"
import { useFeatureFlag } from "@/hooks/use-feature-flag"

const squadBuys = [
  {
    id: 1,
    name: "Gaming Earbuds Pro Bundle",
    originalPrice: "৳5,999",
    squadPrice: "৳3,999",
    discount: "33%",
    members: 42,
    maxMembers: 50,
    timeLeft: "2h 30m",
    image: "/gaming-earbuds.jpg",
  },
  {
    id: 2,
    name: "Ultra Wireless Charger Pack",
    originalPrice: "৳2,500",
    squadPrice: "৳1,299",
    discount: "48%",
    members: 38,
    maxMembers: 40,
    timeLeft: "1h 15m",
    image: "/wireless-charger-pack.jpg",
  },
  {
    id: 3,
    name: "Smart Ring Lights Combo",
    originalPrice: "৳8,999",
    squadPrice: "৳5,499",
    discount: "39%",
    members: 29,
    maxMembers: 50,
    timeLeft: "4h 45m",
    image: "/smart-ring-lights.jpg",
  },
]

export function SquadBuys() {
  const { isEnabled: squadBuysEnabled, loading } = useFeatureFlag("squad_buys_enabled")

  // Hide section if feature is disabled
  if (!loading && !squadBuysEnabled) {
    return null
  }

  return (
    <section className="relative px-4 py-20 border-t border-cyan-500/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-purple-400">SQUAD BUYING</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
            Join the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Crew & Save Big
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Bulk discounts unlock as more people join your squad</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {squadBuys.map((squad, index) => (
            <motion.div
              key={squad.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <div className="relative border border-purple-500/30 backdrop-blur-sm bg-black/50 rounded-xl overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black">
                  <img
                    src={squad.image || "/placeholder.svg"}
                    alt={squad.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/80 text-black font-bold text-xs rounded-full">
                    {squad.discount} OFF
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/80 backdrop-blur rounded-lg">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-orange-400">{squad.timeLeft}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-3 line-clamp-2">{squad.name}</h3>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Squad Members</span>
                      <span className="text-xs font-bold text-purple-400">
                        {squad.members}/{squad.maxMembers}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(squad.members / squad.maxMembers) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs line-through text-gray-500">{squad.originalPrice}</span>
                      <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        {squad.squadPrice}
                      </span>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                    Join Squad
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
