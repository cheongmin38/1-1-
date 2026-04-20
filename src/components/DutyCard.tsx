import { motion } from 'motion/react';
import { User, ShieldCheck, Sparkles } from 'lucide-react';

export default function DutyCard() {
  const duties = [
    { title: '칠판 도우미', names: ['최서연'], icon: '🖍️' },
  ];

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="ios-card flex flex-col h-full bg-[#1C1C1E] text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <ShieldCheck className="w-24 h-24 text-ios-blue" />
      </div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex flex-col">
           <h2 className="text-xl font-black text-white tracking-tight">이번 주 당번</h2>
           <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest">Classroom Duty</span>
        </div>
        <ShieldCheck className="w-5 h-5 text-ios-blue" />
      </div>

      <div className="space-y-3 flex-1 relative z-10">
        {duties.map((duty, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-[2rem] flex flex-col gap-2 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-ios-gray">{duty.title}</span>
              <span className="text-base">{duty.icon}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {duty.names.map((name, ni) => (
                <div key={ni} className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-2xl">
                  <User className="w-3 h-3 text-ios-blue" />
                  <span className="text-xs font-bold">{name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
