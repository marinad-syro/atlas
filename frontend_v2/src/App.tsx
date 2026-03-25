/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, RotateCcw, X, ExternalLink, Plane, Hotel, MapPin, Target, Globe } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { TRIP_TOOL_DEFINITION, TripData } from './types';
import { floatTo16BitPCM, base64ToFloat32, bufferToBase64 } from './audio-utils';

const MODEL_NAME = "gemini-2.5-flash-native-audio-preview-12-2025";

export default function App() {
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tripData, setTripData] = useState<TripData>({});
  const [isMockMode, setIsMockMode] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // Scroll ref for trip cards
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const stopConversation = useCallback(async () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsConversationActive(false);
    setStatus('idle');
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current || !audioContextRef.current) {
      if (audioQueueRef.current.length === 0 && isPlayingRef.current === false) {
        // Only set to listening if we were speaking and finished the queue
        if (status === 'speaking') setStatus('listening');
      }
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;
    const audioBuffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    audioBuffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextInQueue();
    };
    source.start();
  }, [status]);

  const startConversation = async () => {
    try {
      setErrorMessage(null);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const session = await ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful travel planning assistant. Help the user plan a trip. Use the show_trip_section tool to display information as you find it. Be concise and friendly.",
          tools: [TRIP_TOOL_DEFINITION]
        },
        callbacks: {
          onopen: () => {
            setIsConversationActive(true);
            setStatus('listening');
            
            // Setup audio capture
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = floatTo16BitPCM(inputData);
              session.sendRealtimeInput({
                audio: { data: bufferToBase64(pcmData), mimeType: 'audio/pcm;rate=16000' }
              });
            };

            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData) {
                  const audioData = base64ToFloat32(part.inlineData.data);
                  audioQueueRef.current.push(audioData);
                  setStatus('speaking');
                  playNextInQueue();
                }
              }
            }

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setStatus('listening');
            }

            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                if (call.name === 'show_trip_section') {
                  const { section, data } = call.args as any;
                  setTripData(prev => ({ ...prev, [section]: data }));
                  
                  // Send response back to model
                  session.sendToolResponse({
                    functionResponses: [{
                      id: call.id,
                      response: { result: "Section displayed successfully" }
                    }]
                  });
                }
              }
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus('error');
            setErrorMessage("Connection error. Please try again.");
          },
          onclose: () => {
            stopConversation();
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setStatus('error');
      setErrorMessage("Could not access microphone or connect to AI.");
    }
  };

  const resetTrip = () => {
    setTripData({});
    if (isConversationActive) {
      stopConversation();
      startConversation();
    }
  };

  // Orb Animation Variants
  const orbVariants = {
    idle: {
      borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "50% 50% 50% 50% / 50% 50% 50% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
      y: [0, -14, 0],
      transition: {
        borderRadius: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    listening: {
      borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
      y: [0, -14, 0],
      transition: {
        borderRadius: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    speaking: {
      borderRadius: ["20% 80% 20% 80% / 80% 20% 80% 20%", "80% 20% 80% 20% / 20% 80% 20% 80%", "20% 80% 20% 80% / 80% 20% 80% 20%"],
      scale: [1, 1.1, 1],
      y: [0, -14, 0],
      boxShadow: [
        "0 0 30px rgba(139, 92, 246, 0.4)",
        "0 0 60px rgba(139, 92, 246, 0.7)",
        "0 0 30px rgba(139, 92, 246, 0.4)"
      ],
      transition: {
        borderRadius: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
        boxShadow: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
      }
    }
  };

  const hasData = Object.keys(tripData).length > 0;

  const showSampleData = () => {
    setTripData({
      destination: {
        placeName: "Kyoto, Japan",
        summary: "Experience the perfect blend of ancient tradition and modern beauty. Kyoto is home to thousands of classical Buddhist temples, as well as gardens, imperial palaces, Shinto shrines and traditional wooden houses.",
        readMoreUrl: "https://www.japan-guide.com/e/e2158.html"
      },
      flights: {
        route: "LHR → KIX (Direct)",
        dates: "Oct 12 - Oct 26",
        flightNote: "Best value found on Japan Airlines. Prices are currently stable.",
        skyscannerUrl: "https://www.skyscanner.net"
      },
      hotels: {
        hotels: [
          { name: "The Thousand Kyoto", price: "£240/night", bookingUrl: "https://www.booking.com" },
          { name: "Ace Hotel Kyoto", price: "£185/night", bookingUrl: "https://www.booking.com" },
          { name: "Ryokan Gion Hatanaka", price: "£310/night", bookingUrl: "https://www.booking.com" }
        ],
        bookingMainUrl: "https://www.booking.com"
      },
      activities: {
        activities: [
          { title: "Fushimi Inari Shrine", description: "Walk through the iconic thousands of vermilion torii gates.", infoUrl: "#" },
          { title: "Arashiyama Bamboo Grove", description: "Stroll through the towering stalks of green bamboo.", infoUrl: "#" },
          { title: "Gion District Walk", description: "Explore the historic geisha district at twilight.", infoUrl: "#" },
          { title: "Tea Ceremony Experience", description: "Learn the art of traditional Japanese tea preparation.", infoUrl: "#" }
        ]
      }
    });
  };

  return (
    <div className={`flex flex-col items-center justify-between h-screen ${hasData ? 'max-w-3xl' : 'max-w-sm'} mx-auto px-4 py-6 relative z-20 transition-all duration-500`}>
      {/* Top Actions */}
      <div className="absolute top-6 left-4 z-30">
        {!hasData && !isConversationActive && (
          <button 
            onClick={showSampleData}
            className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest glass px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            Preview Cards
          </button>
        )}
      </div>

      {/* Centre Content */}
      <main className={`flex-1 w-full flex flex-col items-center ${hasData ? 'justify-start pt-16' : 'justify-center -mt-12'} relative overflow-hidden transition-all duration-500`}>
        <AnimatePresence mode="wait">
          {!hasData ? (
            <motion.div
              key="orb"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative"
            >
              <motion.div
                variants={orbVariants}
                animate={status === 'error' ? 'idle' : status}
                className="w-56 h-56 glass overflow-hidden flex items-center justify-center shadow-2xl relative"
              >
                {/* Moving colors inside */}
                <div className="absolute inset-0 animate-moving-colors opacity-40 blur-xl" />
                <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse relative z-10" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="trip-cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full flex flex-col"
            >
              {/* Progress Icons */}
              <div className="absolute -top-10 right-0 flex gap-2 p-2 z-30">
                {['destination', 'flights', 'hotels', 'activities'].map((s, i) => {
                  const icons = [<Globe size={16}/>, <Plane size={16}/>, <Hotel size={16}/>, <Target size={16}/>];
                  const active = !!(tripData as any)[s];
                  return (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: active ? 1 : 0.2 }}
                      className={`p-1.5 rounded-full glass ${active ? 'text-indigo-600' : 'text-gray-400'}`}
                    >
                      {icons[i]}
                    </motion.div>
                  );
                })}
              </div>

              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-24 no-scrollbar"
              >
                {tripData.destination && (
                  <Card title="Destination 🌍" icon={<MapPin className="text-indigo-500" size={18}/>}>
                    <h3 className="font-bold text-lg text-gray-800">{tripData.destination.placeName}</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-4">{tripData.destination.summary}</p>
                    <a href={tripData.destination.readMoreUrl} target="_blank" className="inline-flex items-center text-indigo-600 text-sm font-medium mt-3 hover:underline">
                      Read more <ExternalLink size={12} className="ml-1"/>
                    </a>
                  </Card>
                )}

                {tripData.flights && (
                  <Card title="Flights ✈️" icon={<Plane className="text-indigo-500" size={18}/>}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">{tripData.flights.route}</p>
                        <p className="text-xs text-gray-500">{tripData.flights.dates}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">"{tripData.flights.flightNote}"</p>
                    <a 
                      href={tripData.flights.skyscannerUrl} 
                      target="_blank" 
                      className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors"
                    >
                      Search Skyscanner →
                    </a>
                  </Card>
                )}

                {tripData.hotels && (
                  <Card title="Hotels 🏨" icon={<Hotel className="text-indigo-500" size={18}/>}>
                    <div className="space-y-2">
                      {tripData.hotels.hotels.slice(0, 3).map((hotel, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/30 p-2 rounded-lg">
                          <div className="truncate mr-2">
                            <p className="text-xs font-bold text-gray-800 truncate">{hotel.name}</p>
                            <p className="text-[10px] text-gray-500">{hotel.price}</p>
                          </div>
                          <a href={hotel.bookingUrl} target="_blank" className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
                            Book →
                          </a>
                        </div>
                      ))}
                    </div>
                    <a href={tripData.hotels.bookingMainUrl} target="_blank" className="block text-center text-[10px] text-indigo-600 mt-2 font-medium hover:underline">
                      View all on Booking.com
                    </a>
                  </Card>
                )}

                {tripData.activities && (
                  <Card title="Activities 🎯" icon={<Target className="text-indigo-500" size={18}/>}>
                    <div className="space-y-3">
                      {tripData.activities.activities.slice(0, 3).map((act, i) => (
                        <div key={i} className="relative pl-5">
                          <span className="absolute left-0 top-0 text-indigo-400 font-black text-sm leading-none">{i + 1}</span>
                          <p className="text-xs font-bold text-gray-800 truncate">{act.title}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-1">{act.description}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 italic text-center">And more...</p>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Status / Hints Area */}
      <div className="w-full min-h-[80px] flex flex-col items-center justify-center text-center px-4 -mt-8">
        {status === 'idle' && !hasData && (
          <p className="text-xs italic text-gray-500">Try saying "I want to go to Tokyo in April"</p>
        )}
        {(status === 'listening' || status === 'speaking') && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-indigo-400 font-medium"
          >
            {status === 'listening' ? 'listening...' : 'speaking...'}
          </motion.p>
        )}
        {status === 'error' && (
          <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
        )}
      </div>

      {/* Bottom Controls */}
      <footer className="w-full flex items-center justify-between pb-8 px-4">
        <div className="w-12 flex justify-center">
          {isConversationActive && (
            <button 
              onClick={resetTrip}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 shadow-sm hover:bg-white/40 transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>

        <div className="relative">
          {isConversationActive && (
            <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-mic-ring" />
          )}
          <button
            onClick={() => !isConversationActive && startConversation()}
            disabled={isConversationActive}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all z-10 relative glass ${
              isConversationActive 
                ? 'bg-indigo-600/40 text-white cursor-default' 
                : 'text-indigo-600 hover:scale-105 active:scale-95'
            }`}
          >
            <Mic size={24} className={isConversationActive ? 'animate-pulse' : ''} />
          </button>
        </div>

        <div className="w-12 flex justify-center">
          {isConversationActive && (
            <button 
              onClick={stopConversation}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 shadow-sm hover:bg-white/40 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function Card({ title, icon, children }: { title: string, icon: ReactNode, children: ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-5 w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-white/40">
          {icon}
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
