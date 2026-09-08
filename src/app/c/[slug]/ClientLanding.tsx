"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WhatsAppForm } from "./WhatsAppForm";
import { LandingConfig } from "@/types/landing-config";
import ClassBook from "@/components/ClassBook";
import type { AlbumPage, AlbumPhoto } from "@/lib/album";

export interface ClassWithSchool {
  id: string;
  name: string;
  school: { name: string } | null;
}

interface ClientLandingProps {
  cls: ClassWithSchool;
  albumPages: AlbumPage[];
  albumPhotos: AlbumPhoto[];
  config: LandingConfig;
}

export default function ClientLanding({ cls, albumPages, albumPhotos, config }: ClientLandingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const slideInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  if (!mounted) return null;

  const schoolName = cls.school?.name || ''
  const className = cls.name || ''

  const heroBg = config.hero.backgroundImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop'
  const whyImage = config.whyClassbook.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop'

  return (
    <main className="w-full bg-[#1E1E1E] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen pt-20 pb-20 bg-black/60 bg-blend-overlay" style={{
        backgroundImage: `url('${heroBg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <div className="container mx-auto px-4 max-w-4xl text-center z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInUp}>
            <div className="inline-block bg-primary text-black px-4 py-1 font-bold tracking-widest mb-6 font-sans text-sm uppercase">
              {schoolName} • {className}
            </div>
            <h2 className="uppercase font-bold text-4xl md:text-5xl leading-tight mb-8">
              {config.hero.title} <br /><br />
              <span className="text-white">{config.hero.subtitle}</span>
            </h2>
            <div className="text-white/70 text-lg md:text-xl mb-10 max-w-3xl mx-auto">
              {config.hero.description}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-primary pt-16 pb-12 text-[#1E1E1E]">
        <div className="container mx-auto px-4 max-w-6xl border-r-4 border-[#333333] pr-6 md:pr-12 text-left">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <h6 className="font-bold tracking-wider mb-4 text-[#333333] uppercase text-sm md:text-base font-sans">
              {config.intro.label}
            </h6>
            <h2 className="text-3xl md:text-5xl leading-tight font-bold text-[#1E1E1E] -mb-2">
              {config.intro.title}
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Photobook Details Grid */}
      <section className="bg-primary pt-4 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[600px]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft} className="relative group overflow-hidden h-[400px] md:h-full">
              <Image
                src="https://images.unsplash.com/photo-1544644799-c8ce6a6a090e?q=80&w=2070&auto=format&fit=crop"
                alt="Photobook cover"
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100">
                <div className="border border-white/20 p-8 w-full h-full flex items-center justify-center">
                  <h3 className="text-white text-center uppercase tracking-[0.2em] font-sans font-medium text-lg md:text-xl leading-relaxed">Красивая твёрдая обложка</h3>
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight} className="relative group overflow-hidden h-[400px] md:h-full">
              <Image
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop"
                alt="Photobook inside"
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100">
                <div className="border border-white/20 p-8 w-full h-full flex items-center justify-center">
                  <h3 className="text-white text-center uppercase tracking-[0.2em] font-sans font-medium text-lg md:text-xl leading-relaxed">Страницы, наполненные воспоминаниями</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Classbook Section */}
      <section className="py-16 md:py-24 bg-[#1E1E1E]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft} className="w-full md:w-1/2 order-2 md:order-1 h-[500px] md:h-[700px] relative">
              <Image
                src={whyImage}
                alt="Kids"
                fill
                unoptimized
                className="object-cover"
              />
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight} className="w-full md:w-1/2 order-1 md:order-2">
              <h2 className="uppercase font-bold text-2xl md:text-3xl mb-6 font-sans">
                {config.whyClassbook.title}
              </h2>
              <div className="text-slate-300 space-y-4 font-sans text-base leading-relaxed">
                {config.whyClassbook.paragraphs.map((p, i) => (
                  <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Heroes Slider Section */}
      <section className="bg-primary py-16 md:py-24 text-[#1E1E1E]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft} className="w-full lg:w-1/3">
              <div className="border-r-4 border-[#333333] pr-6 mb-6">
                <h6 className="font-bold tracking-wider mb-4 text-[#1E1E1E] uppercase text-sm md:text-base font-sans">
                  Герои вашей школьной истории
                </h6>
                <h2 className="text-3xl md:text-4xl leading-tight font-bold text-[#1E1E1E]">
                  Ваши дети — герои этой истории
                </h2>
              </div>
              <p className="text-[#333333] font-sans">
                Каждый ребёнок в вашем классе стал частью этой фотокниги. Мы сохранили их настоящие эмоции и моменты: от шуток до тихих размышлений. Это история, которую они будут помнить всю жизнь.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight} className="w-full lg:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Люблю перемену",
                    text: "На перемене дети смеются и наслаждаются временем вместе.",
                    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"
                  },
                  {
                    title: "Мы доверяем друг другу",
                    text: "Смех и радость наполняют уроки.",
                    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
                  },
                  {
                    title: "Интересные занятия",
                    text: "",
                    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2070&auto=format&fit=crop"
                  },
                  {
                    title: "Весёлые моменты",
                    text: "Мы запечатлели дружбу",
                    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2070&auto=format&fit=crop"
                  },
                  {
                    title: "Душевные разговоры",
                    text: "",
                    image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?q=80&w=2070&auto=format&fit=crop"
                  },
                  {
                    title: "Лучшие воспоминания",
                    text: "Незабываемые моменты школьной жизни.",
                    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2070&auto=format&fit=crop"
                  }
                ].map((card) => (
                  <div key={card.title} className="relative group overflow-hidden aspect-[4/3]">
                    <Image src={card.image} alt={card.title} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-center">
                      <h6 className="uppercase font-bold text-white mb-2 font-sans text-lg">{card.title}</h6>
                      {card.text ? <p className="text-white/80 font-sans text-sm leading-relaxed">{card.text}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Classbook Demo Carousel */}
      {albumPages.length > 0 && (
        <ClassBook title={config.photobook.title} pages={albumPages} photos={albumPhotos} />
      )}

      {/* Atmosphere Section */}
      <section className="py-16 md:py-24 bg-[#1E1E1E]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Мы снимаем не кадры, а атмосферу
            </h2>
            <p className="text-slate-300 leading-relaxed font-sans">
              Фотографы КнигаКит работают с психологами, чтобы создать атмосферу, в которой дети чувствуют себя комфортно и естественно. Съёмка объединяет детей, дарит смех, дружбу и уверенность. Классбук — это не только память, но и инструмент для создания тёплой атмосферы в классе.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Did You Know Section */}
      <section className="py-16 md:py-24 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              А вы знали, что...
            </h2>
            <p className="text-slate-300 leading-relaxed font-sans mb-10 whitespace-pre-line">{"Классбук можно и нужно использовать как инструмент сближения детей и родителей.\nВо время съёмки дети учатся слышать друг друга, а родители — видеть своего ребёнка с новой стороны.\nЭто больше, чем альбом — это способ восстановить связь, которую так легко потерять в суете."}</p>
            <a
              href="https://instrukciya.bitrix24site.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-black font-bold px-8 py-4 hover:opacity-90 transition"
            >
              Читать инструкцию к классбуку
            </a>
          </motion.div>
        </div>
      </section>

      {/* Order & Specs Section */}
      <section className="py-16 md:py-24 bg-[#1E1E1E]">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInUp}>
            <p className="text-slate-200 text-lg md:text-xl leading-relaxed mb-6 font-sans">
              Чтобы заказать фотокнигу, обратитесь к классному руководителю. Для всех желающих приобрести Классбук будет открыта запись через mos.ru
            </p>
            <p className="text-slate-400 mb-10 font-sans">
              Электронные версии фотографий будут доступны для приобретения позднее.
            </p>
            <ul className="space-y-3 text-slate-300 font-sans leading-relaxed border-l-2 border-primary pl-6">
              <li>Формат: 21×30 см (A4)</li>
              <li>Количество страниц: 60</li>
              <li>Переплёт: твёрдый, классический книжный</li>
              <li>Бумага блока: мелованная, плотность 170 г/м² — устойчива к износу и идеально передаёт цвет и фактуру фото</li>
              <li>Печать: цветная цифровая, профессиональная, с высокой цветопередачей</li>
              <li>Обложка: ламинированная, с матовым или глянцевым покрытием, персональная верстка под каждый класс</li>
              <li>Производство: собственная типография КЛАССБУК</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Form / Footer CTA */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInUp}>
            <h2 className="text-3xl md:text-5xl font-bold mb-10 font-serif">Если остались вопросы, заполните форму</h2>

            <WhatsAppForm schoolName={schoolName} className={className} packages={config.cta.packages} />

          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-black py-8 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} Классбук. Все права защищены.</p>
      </footer>
    </main>
  );
}
