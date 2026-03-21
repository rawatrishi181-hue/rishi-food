import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bike, 
  Wallet, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  TrendingUp
} from 'lucide-react';

const PartnerLanding = () => {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center bg-[#0f172a] text-white">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1625231334168-35067f8853ed?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-40"
            alt="Delivery Partner"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="max-w-2xl space-y-6"
          >
            <span className="bg-primary/20 text-primary-light border border-primary/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              Join the Fleet
            </span>
            <h1 className="text-5xl sm:text-7xl font-black leading-tight italic">
              Be Your Own Boss. <br />
              <span className="text-primary">Earn Big.</span>
            </h1>
            <p className="text-gray-300 text-xl font-medium max-w-lg">
              Deliver food, earn competitive pay, and enjoy the freedom of choosing your own hours.
            </p>
            <div className="flex gap-4 pt-4">
              <Link 
                to="/partner/register" 
                className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center gap-2 shadow-2xl shadow-primary/30"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black text-gray-800 italic">Why Partner With Us?</h2>
          <p className="text-gray-500 font-medium italic">We offer the best benefits in the industry for our delivery partners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              icon: <Wallet className="w-10 h-10 text-primary" />, 
              title: 'Great Earnings', 
              desc: 'Get competitive pay per delivery plus 100% of your tips.' 
            },
            { 
              icon: <Clock className="w-10 h-10 text-primary" />, 
              title: 'Flexible Hours', 
              desc: 'You decide when and how much you want to work.' 
            },
            { 
              icon: <ShieldCheck className="w-10 h-10 text-primary" />, 
              title: 'Insurance Cover', 
              desc: 'Accidental insurance coverage for all active partners.' 
            }
          ].map((benefit, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 bg-white rounded-[40px] shadow-xl border border-gray-50 space-y-6"
            >
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-800 italic">{benefit.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80" 
                className="rounded-[60px] shadow-2xl"
                alt="Working"
              />
            </div>
            <div className="lg:w-1/2 space-y-10">
              <h2 className="text-4xl font-black text-gray-800 italic">How to Get Started?</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Register Online', desc: 'Fill the signup form with your basic details and documents.' },
                  { step: '02', title: 'Get Verified', desc: 'Our team will verify your driving license and vehicle RC within 24 hours.' },
                  { step: '03', title: 'Start Delivering', desc: 'Login to the partner app, accept orders, and start earning.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-5xl font-black text-primary/20 italic">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-black text-gray-800 italic mb-2">{item.title}</h4>
                      <p className="text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 container mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-gray-800 italic mb-16">Real Stories, Real Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[
            { 
              name: 'Rahul Sharma', 
              earnings: '₹12,000/week', 
              image: 'https://i.pravatar.cc/150?u=rahul',
              text: 'Joining Rishi Food as a partner changed my life. The flexible hours allow me to spend time with my family.'
            },
            { 
              name: 'Anita Devi', 
              earnings: '₹8,500/week', 
              image: 'https://i.pravatar.cc/150?u=anita',
              text: 'I love being my own boss. The app is so easy to use and I get my payments on time every week.'
            }
          ].map((t, i) => (
            <div key={i} className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-50 flex flex-col items-center space-y-6">
              <img src={t.image} className="w-20 h-20 rounded-full border-4 border-primary/20" alt={t.name} />
              <p className="text-gray-600 italic font-medium text-lg leading-relaxed">"{t.text}"</p>
              <div>
                <h4 className="font-black text-gray-800">{t.name}</h4>
                <p className="text-primary font-bold">{t.earnings}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary mx-6 rounded-[60px] mb-24 text-center text-white space-y-8 shadow-2xl shadow-primary/40">
        <h2 className="text-5xl font-black italic">Ready to Ride?</h2>
        <p className="text-xl font-medium opacity-90">Join 5000+ delivery partners across India.</p>
        <Link 
          to="/partner/register" 
          className="bg-white text-primary px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all inline-block"
        >
          Register as Partner
        </Link>
      </section>
    </div>
  );
};

export default PartnerLanding;
