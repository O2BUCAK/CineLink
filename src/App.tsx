import React, { useState, useEffect } from 'react';
import { GameStage, GameState, LeaderboardEntry, LinkStep } from './types';
import { getNewChallenge, verifyLink, calculateShortestPath } from './services/geminiService';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  db,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  handleFirestoreError,
  OperationType
} from './services/firebase';

const safeGetItem = (key: string, defaultValue: string = ''): string => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key) || defaultValue;
    }
  } catch (e) {
    console.warn(`localStorage.getItem failed for key "${key}":`, e);
  }
  return defaultValue;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`localStorage.setItem failed for key "${key}":`, e);
  }
};

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.HOME);
  const [nickname, setNickname] = useState<string>(() => safeGetItem('cinelink_nickname'));
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tempEntries, setTempEntries] = useState<LeaderboardEntry[]>([]);
  const [playCount, setPlayCount] = useState<number>(1);
  const [user, setUser] = useState<any>(null);
  const [acceptedKVKK, setAcceptedKVKK] = useState<boolean>(() => {
    return safeGetItem('cinelink_kvkk_accepted') === 'true';
  });

  // Listen to Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Prefill nickname if empty or generic placeholder
        const savedNick = safeGetItem('cinelink_nickname');
        if (!savedNick || savedNick === 'Oyuncu') {
          const defaultNick = currentUser.displayName?.replace(/\s+/g, '') || 'Oyuncu';
          setNickname(defaultNick);
          safeSetItem('cinelink_nickname', defaultNick);
        }

        // Fetch user playCount
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          let userSnap;
          try {
            userSnap = await getDoc(userRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          }
          if (userSnap && userSnap.exists()) {
            const storedPlayCount = userSnap.data().playCount || 0;
            setPlayCount(storedPlayCount + 1);
          } else {
            setPlayCount(1);
          }
        } catch (e) {
          console.error("Error loading playCount from Firestore:", e);
        }
      } else {
        // Fallback to local guest session playCount (not saved to localstorage to ensure deletion upon next session)
        setPlayCount(1);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load leaderboard from Firestore (with local fallback)
  const loadLeaderboardData = async () => {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('score', 'asc'), limit(30));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'leaderboard');
      }
      const docs: LeaderboardEntry[] = [];
      if (querySnapshot) {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          docs.push({
            id: doc.id,
            nickname: data.nickname || 'Anonim',
            score: data.score,
            date: data.date || '',
            chain: data.chain || [],
            playCount: data.playCount || 1,
            userId: data.userId
          });
        });
      }

      if (docs.length > 0) {
        setLeaderboard(docs);
      } else {
        const defaultLeaderboard: LeaderboardEntry[] = [
          { nickname: "SinemaSever_34", score: 50, date: "22.06.2026", chain: ["Şener Şen", "Av Mevsimi", "Cem Yılmaz"], playCount: 3 },
          { nickname: "YeşilçamAşığı", score: 75, date: "21.06.2026", chain: ["Kemal Sunal", "Hababam Sınıfı", "Şener Şen", "Eşkıya", "Uğur Yücel"], playCount: 12 },
          { nickname: "SineFil_06", score: 75, date: "20.06.2026", chain: ["Haluk Bilginer", "Kış Uykusu", "Nuri Bilge Ceylan"], playCount: 1 }
        ];
        setLeaderboard(defaultLeaderboard);
      }
    } catch (e) {
      console.error("Firestore leaderboard load failed, falling back to local:", e);
      const saved = safeGetItem('cinalink_leaderboard_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setLeaderboard(parsed);
            return;
          }
        } catch (_) {}
      }
      const defaultLeaderboard: LeaderboardEntry[] = [
        { nickname: "SinemaSever_34", score: 50, date: "22.06.2026", chain: ["Şener Şen", "Av Mevsimi", "Cem Yılmaz"], playCount: 3 },
        { nickname: "YeşilçamAşığı", score: 75, date: "21.06.2026", chain: ["Kemal Sunal", "Hababam Sınıfı", "Şener Şen", "Eşkıya", "Uğur Yücel"], playCount: 12 },
        { nickname: "SineFil_06", score: 75, date: "20.06.2026", chain: ["Haluk Bilginer", "Kış Uykusu", "Nuri Bilge Ceylan"], playCount: 1 }
      ];
      setLeaderboard(defaultLeaderboard);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, [stage]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      setInfoMsg(`Başarıyla giriş yapıldı: ${loggedInUser.displayName}`);
      await loadLeaderboardData();
    } catch (e: any) {
      console.error("Sign in error:", e);
      if (e.code === 'auth/popup-blocked') {
        setErrorMsg('Giriş penceresi tarayıcı tarafından engellendi. Lütfen pop-up engelleyicinizi devre dışı bırakın veya uygulamayı yeni sekmede açın.');
      } else {
        setErrorMsg('Google ile giriş yapılırken bir hata oluştu: ' + (e.message || e));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      await signOut(auth);
      setInfoMsg('Başarıyla çıkış yapıldı.');
      await loadLeaderboardData();
    } catch (e: any) {
      setErrorMsg('Çıkış yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const saveToLeaderboard = async (finalChain: LinkStep[], score: number) => {
    const today = new Date().toLocaleDateString('tr-TR');
    
    if (user) {
      try {
        const uid = user.uid;
        const userRef = doc(db, 'users', uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        }
        
        let newPlayCount = 1;
        if (userSnap && userSnap.exists()) {
          newPlayCount = (userSnap.data().playCount || 0) + 1;
          try {
            await updateDoc(userRef, { playCount: newPlayCount });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
          }
        } else {
          try {
            await setDoc(userRef, { playCount: 1 });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
          }
        }
        
        // Update state
        setPlayCount(newPlayCount + 1);

        const newEntry = {
          nickname: nickname.trim(),
          score: score,
          date: today,
          chain: finalChain.map(c => c.name),
          playCount: newPlayCount,
          userId: uid
        };

        try {
          await addDoc(collection(db, 'leaderboard'), newEntry);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'leaderboard');
        }
        setInfoMsg("Tebrikler! Rekorunuz Google Hesabınızla kalıcı olarak kaydedildi.");
        await loadLeaderboardData();
      } catch (e: any) {
        console.error("Firestore saveToLeaderboard error:", e);
        setErrorMsg("Rekor kaydedilirken bir hata oluştu: " + (e.message || e));
      }
    } else {
      // Unauthenticated -> Temporary list only. Restores on next session (cleared on refresh).
      const currentPlay = playCount;
      const tempEntry: LeaderboardEntry = {
        nickname: nickname.trim(),
        score: score,
        date: today,
        chain: finalChain.map(c => c.name),
        playCount: currentPlay,
        isTemporary: true
      };
      
      setTempEntries(prev => [...prev, tempEntry]);
      setPlayCount(prev => prev + 1);
      setInfoMsg("Tebrikler! Rekorunuz geçici olarak listeye eklendi (Giriş yapmadığınız için sonraki oturumda silinecektir).");
    }
  };

  const handleAcceptKVKK = () => {
    setAcceptedKVKK(true);
    safeSetItem('cinelink_kvkk_accepted', 'true');
  };

  const startNewGame = async () => {
    if (!nickname.trim()) {
      setErrorMsg('Lütfen önce kendiniz için yaratıcı bir takma ad (nickname) belirleyin.');
      return;
    }
    if (!acceptedKVKK) {
      setErrorMsg('Oyuna başlamak için yerel bilgi saklama ve KVKK bilgilendirme metnini onaylamanız gerekmektedir.');
      return;
    }
    safeSetItem('cinelink_nickname', nickname.trim());
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const challenge = await getNewChallenge();
      setGameState({
        startNode: challenge.start,
        endNode: challenge.end,
        currentChain: [{ type: 'PERSON', name: challenge.start }],
        isFinished: false,
        score: 0,
        shortestPathSteps: 0,
        warning: challenge.warning
      });
      setStage(GameStage.PLAYING);
    } catch (e: any) {
      setErrorMsg(e.message || 'Meydan okuma yüklenirken bir bağlantı hatası oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!inputVal.trim() || !gameState) return;
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    
    const lastNode = gameState.currentChain[gameState.currentChain.length - 1].name;
    const proposedLink = inputVal.trim();
    
    try {
      const { isValid, explanation } = await verifyLink(lastNode, proposedLink);
      if (isValid) {
        // Automatically alternation between PERSON and MOVIE types based on steps
        const isNextMovie = gameState.currentChain.length % 2 !== 0;
        const newStep: LinkStep = { 
          type: isNextMovie ? 'MOVIE' : 'PERSON', 
          name: proposedLink 
        };
        const newChain = [...gameState.currentChain, newStep];
        
        // If the added node name matches the target (case-insensitive check)
        if (proposedLink.toLowerCase() === gameState.endNode.toLowerCase()) {
          await finishGame(newChain);
        } else {
          setGameState({ ...gameState, currentChain: newChain });
          setInputVal('');
          setInfoMsg(`Bağlantı doğrulandı! ${explanation}`);
        }
      } else {
        setErrorMsg(`Geçersiz Bağlantı: ${explanation || 'Girdiğiniz veri ile mevcut adım arasında doğrudan bir bağ saptanamadı.'}`);
      }
    } catch (e) {
      setErrorMsg('Bağlantı doğrulaması esnasında sunucu ile iletişim kesildi.');
    } finally {
      setLoading(false);
    }
  };

  const checkDirectFinish = async () => {
    if (!gameState) return;
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    const lastNode = gameState.currentChain[gameState.currentChain.length - 1].name;
    
    try {
      const { isValid, explanation } = await verifyLink(lastNode, gameState.endNode);
      if (isValid) {
        const isNextMovie = gameState.currentChain.length % 2 !== 0;
        const newChain = [...gameState.currentChain, { 
          type: isNextMovie ? 'MOVIE' : 'PERSON', 
          name: gameState.endNode 
        } as LinkStep];
        await finishGame(newChain);
      } else {
        setErrorMsg(`"${lastNode}" ile hedef "${gameState.endNode}" arasında doğrudan bir bağ saptanamadı. Lütfen ara adımlar eklemeye devam edin.`);
      }
    } catch (e) {
      setErrorMsg('Bağlantı doğrulanırken bir sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const finishGame = async (finalChain: LinkStep[]) => {
    if (!gameState) return;
    setLoading(true);
    const userSteps = finalChain.length - 1;
    
    try {
      const result = await calculateShortestPath(gameState.startNode, gameState.endNode, userSteps);
      
      // Calculate score logic: base score of 25 pts per step.
      // If the user's trajectory matches the optimal length, great! Otherwise, apply penalties.
      let totalScore = userSteps * 25;
      if (userSteps > result.shortest && result.shortest > 0) {
        totalScore += 50; // Penalty for missing the optimal chain
      }

      const finalState = {
        ...gameState,
        currentChain: finalChain,
        isFinished: true,
        score: totalScore,
        shortestPathSteps: result.shortest
      };
      
      setGameState(finalState);
      await saveToLeaderboard(finalChain, totalScore);
      setStage(GameStage.RESULT);
    } catch (e) {
      setStage(GameStage.RESULT);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && inputVal.trim()) {
      handleAddLink();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-radial from-emerald-950/20 via-blue-950/5 to-transparent pointer-events-none -z-10" />

      <header className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
            🎬
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight gradient-title">CineLink</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Yeşilçam & Dünya Sineması</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
          {/* User auth badge */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 py-1.5 px-2.5 rounded-lg text-xs animate-fade-in">
              {user.photoURL ? (
                <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || ''} className="w-5 h-5 rounded-full" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
              <span className="text-slate-300 font-medium truncate max-w-[120px]">{user.displayName}</span>
              <button 
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 ml-1 font-semibold focus:outline-none cursor-pointer"
                title="Çıkış Yap"
              >
                🚪
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition flex items-center gap-1.5 shadow cursor-pointer"
              id="google_signin_button"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.564-4.445 10.564-10.74 0-.726-.08-1.282-.175-1.975H12.24z"/>
              </svg>
              Google Giriş
            </button>
          )}

          {stage !== GameStage.HOME && (
            <button
              onClick={() => {
                setErrorMsg('');
                setInfoMsg('');
                setStage(GameStage.HOME);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 transition"
              id="header_home_button"
            >
              Ana Sayfa
            </button>
          )}
          <button 
            onClick={() => setStage(GameStage.LEADERBOARD)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500/10 to-blue-500/10 hover:from-teal-500/20 hover:to-blue-500/20 border border-teal-500/20 text-teal-300 transition flex items-center gap-1.5 shadow"
            id="header_leaderboard_button"
          >
            🏆 Liderler
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center animate-fade-in" id="main_game_container">
        {/* HOME STAGE */}
        {stage === GameStage.HOME && (
          <div className="glass-card p-6 md:p-10 rounded-2xl space-y-8 shadow-2xl relative overflow-hidden" id="home_view">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-blue-500" />
            
            <div className="space-y-3">
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sürüm 2026 Yasalarına Uygun
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                Sinema Hafızanı Birleştir!
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Size sunulan iki sinema figürünü (aktör, aktris veya yönetmen) ortak yapımlarıyla birbirine bağla. Amacınız en az adımla hedefe ulaşmaktır!
              </p>
            </div>

            <div className="space-y-2 text-xs bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-slate-400 leading-relaxed space-y-1.5">
              <p className="font-bold text-slate-300 flex items-center gap-1">
                <span>⚡</span> Nasıl Oynanır?
              </p>
              <p>• Başlangıç isminden yola çıkarak onun oynadığı veya yönettiği bir film yazın.</p>
              <p>• Ardından o filmde yer alan başka bir sanatçı ismi girin.</p>
              <p>• Adım adım devam ederek hedeflenen kişiye ulaştığınızda bağlantıyı tamamlayın!</p>
              <p className="text-[11px] text-teal-400 font-medium">Büyük-küçük harf duyarlı değildir. Her adım 25 puan değerindedir.</p>
            </div>

            {/* KVKK / Privacy Notice */}
            <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-900/30 text-[11px] text-slate-400 space-y-2">
              <p className="font-semibold text-blue-300 flex items-center gap-1">
                <span>🔒</span> Bilgi Güvenliği & KVKK Bilgilendirmesi
              </p>
              <p>
                2026 Türkiye yasalarına ve verilerin yerelliği prensibine uygun olarak; belirlediğiniz takma ad (nickname) ve oyun skorlarınız sunucularımızda size ait isim/IP gibi kimlik bilgileriyle ilişkilendirilmeden **tamamen yerel tarayıcı belleğinizde (localStorage)** saklanır. Hiçbir kişisel veri izinsiz üçüncü şahıslara aktarılmaz.
              </p>
              {!acceptedKVKK && (
                <button
                  onClick={handleAcceptKVKK}
                  className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold tracking-wide transition text-xs"
                >
                  Okudum, Onaylıyorum
                </button>
              )}
            </div>

            {/* Google Login block */}
            {!user ? (
              <div className="p-4 bg-gradient-to-r from-blue-950/20 to-indigo-950/20 rounded-xl border border-blue-500/20 text-xs space-y-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-bold text-blue-300 flex items-center justify-center sm:justify-start gap-1">
                    <span>🌟</span> Skorunu Kaybetmek İstemiyor Musun?
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Google ile giriş yaparak rekorlarınızı onur tablosunda kalıcı hale getirebilir, kaçıncı oynayışınızda o puanı aldığınızı saklayabilirsiniz! Giriş yapılmadığında rekorlar sadece bu oturumda listelenir ve sonraki oturumda silinir.
                  </p>
                </div>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full sm:w-auto shrink-0 bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.76-2.4 3.6l3.7 2.87c2.16-2 3.835-4.94 3.835-8.32z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.05 0-5.63-2.06-6.55-4.83L1.935 17.3A11.96 11.96 0 0 0 12 24z"/>
                    <path fill="#FBBC05" d="M5.45 14.49a7.12 7.12 0 0 1 0-4.5l-3.82-2.96a11.96 11.96 0 0 0 0 10.42l3.82-2.96z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.955 1.19 15.24 0 12 0A11.96 11.96 0 0 0 1.935 5.5l3.82 2.96c.92-2.77 3.5-4.83 6.55-4.83z"/>
                  </svg>
                  Google ile Giriş
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/10 rounded-xl border border-emerald-500/15 text-xs flex items-center gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-bold text-emerald-400">Google Hesabı Bağlandı</p>
                  <p className="text-slate-400 text-[11px]">
                    Rekorlarınız kalıcı olarak saklanacaktır. Şu anki denemeniz sizin <strong>{playCount}. oynayışınız</strong> olacaktır.
                  </p>
                </div>
              </div>
            )}

            {!user && (
              <div className="p-4 bg-amber-950/10 rounded-xl border border-amber-500/15 text-xs flex items-center gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="font-bold text-amber-400">Misafir Modu</p>
                  <p className="text-slate-400 text-[11px]">
                    Bu deneme sizin <strong>{playCount}. oynayışınız</strong> olacaktır. Skorunuz sadece listede geçici olarak yer alacak ve sonraki oturumda silinecektir.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                  <span>Takma Ad (Nickname)</span>
                  {user ? (
                    <span className="text-teal-400 font-semibold">Google Profilinden Alındı</span>
                  ) : (
                    <span className="text-slate-500">Yerel Kaydedilir</span>
                  )}
                </label>
                <input 
                  type="text"
                  placeholder="Örn: SinemaBüyücüsü"
                  maxLength={22}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-200 placeholder:text-slate-600 transition"
                  id="nickname_input"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button 
                onClick={startNewGame}
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-950/20 disabled:opacity-50"
                id="start_game_button"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Yükleniyor...' : 'Meydan Okumayı Başlat 🚀'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* PLAYING STAGE */}
        {stage === GameStage.PLAYING && gameState && (
          <div className="space-y-6" id="playing_view">
            {gameState.warning && (
              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-300">
                ℹ️ {gameState.warning}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Node Panel */}
              <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-1 bg-slate-800 text-[9px] text-slate-500 rounded-bl font-mono">
                  #BAŞLANGIÇ
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">BAŞLANGIÇ FİGÜRÜ</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">{gameState.startNode}</p>
                </div>
              </div>

              {/* End Node Panel */}
              <div className="glass-card p-4 rounded-xl border-l-2 border-l-blue-500 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-1 bg-blue-950 text-[9px] text-blue-400 rounded-bl font-mono">
                  #HEDEF
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">HEDEFLENEN FİGÜR</p>
                  <p className="text-lg font-black text-blue-400 mt-1">{gameState.endNode}</p>
                </div>
              </div>
            </div>

            {/* Current Chain Presentation */}
            <div className="glass-card p-6 rounded-2xl space-y-5 shadow-xl relative">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>🔗 Mevcut Bağlantı Zinciri:</span>
                <span className="text-[11px] text-teal-400 font-mono font-medium">
                  {gameState.currentChain.length - 1} Adım Atıldı
                </span>
              </h3>
              
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 min-h-[90px] flex flex-wrap gap-2 items-center">
                {gameState.currentChain.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      step.type === 'PERSON' 
                        ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/15' 
                        : 'bg-blue-950/30 text-blue-300 border border-blue-500/15'
                    }`}>
                      <span>{step.type === 'PERSON' ? '👤' : '🎬'}</span>
                      {step.name}
                    </span>
                    {i < gameState.currentChain.length - 1 && (
                      <span className="text-slate-600 font-bold">→</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    {gameState.currentChain.length % 2 !== 0 ? (
                      <span className="flex items-center gap-1 text-blue-300">
                        🎬 Bir Sonraki Bağı Bir <strong>Film/Dizi</strong> Olarak Yazın:
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-300">
                        👤 Bir Sonraki Bağı Bir <strong>Sanatçı (Oyuncu/Yönetmen)</strong> Olarak Yazın:
                      </span>
                    )}
                  </label>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={gameState.currentChain.length % 2 !== 0 ? "Örn: G.O.R.A." : "Örn: Cem Yılmaz"}
                      className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      disabled={loading}
                      id="next_step_input"
                    />
                    <button 
                      onClick={handleAddLink}
                      disabled={loading || !inputVal.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-6 rounded-lg transition disabled:opacity-50 text-xs tracking-wide"
                      id="submit_step_button"
                    >
                      {loading ? 'Kontrol...' : 'Bağla'}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs animate-fade-in">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {infoMsg && (
                  <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-500/20 text-teal-300 text-xs animate-fade-in">
                    ✅ {infoMsg}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row gap-2 justify-between items-center">
                  <span className="text-[11px] text-slate-500">
                    Cevabı bulamadınız mı? Zincirinizdeki son ismi doğrudan hedefe bağlamayı deneyebilirsin.
                  </span>
                  <button 
                    onClick={checkDirectFinish}
                    disabled={loading}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline focus:outline-none shrink-0"
                    id="direct_finish_button"
                  >
                    Hedefe Doğrudan Bağla?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULT STAGE */}
        {stage === GameStage.RESULT && gameState && (
          <div className="glass-card p-8 md:p-10 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden" id="result_view">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            
            <div className="space-y-2">
              <span className="text-4xl text-emerald-400">🎉</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-emerald-400">Tebrikler, Yolculuk Tamamlandı!</h2>
              <p className="text-sm text-slate-400">
                "{gameState.startNode}" ile "{gameState.endNode}" arasındaki bağlantı zincirini kurdunuz!
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 max-w-[320px] mx-auto space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Toplam Skor</p>
              <p className="text-5xl font-black text-slate-100 font-mono tracking-tight">
                {gameState.score}
              </p>
              <p className="text-[10px] text-slate-500 pt-1">Her adım 25 puandır. Düşük skorlar daha başarılıdır!</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs">
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                <p className="text-slate-500 font-medium">Sizin Adımlarınız</p>
                <p className="font-extrabold text-lg text-emerald-400 mt-0.5">{gameState.currentChain.length - 1}</p>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                <p className="text-slate-500 font-medium">Yapay Zeka Adımı</p>
                <p className="font-extrabold text-lg text-blue-400 mt-0.5">
                  {gameState.shortestPathSteps > 0 ? gameState.shortestPathSteps : 'Hesaplanamadı'}
                </p>
              </div>
            </div>

            {gameState.shortestPathSteps > 0 && gameState.currentChain.length - 1 > gameState.shortestPathSteps && (
              <div className="p-3 bg-amber-950/20 border border-amber-500/20 text-amber-300 text-xs rounded-xl max-w-md mx-auto italic">
                💡 Gemini daha kısa bir yol buldu! Optimal yolu tamamlayamadığınız için +50 ceza puanı uygulandı.
              </div>
            )}

            {/* Display the completed chain */}
            <div className="text-left bg-slate-950/40 p-4 rounded-xl border border-slate-900 max-w-lg mx-auto">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tamamlanan Zincir:</p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {gameState.currentChain.map((step, idx) => (
                  <span key={idx} className="text-xs font-medium text-slate-300 flex items-center gap-1 bg-slate-800/50 py-1 px-2.5 rounded">
                    <span>{step.type === 'PERSON' ? '👤' : '🎬'}</span>
                    {step.name}
                    {idx < gameState.currentChain.length - 1 && <span className="text-slate-600 font-bold">→</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 max-w-md mx-auto">
              <button 
                onClick={() => setStage(GameStage.HOME)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold text-sm transition"
                id="result_play_again_button"
              >
                Yeniden Oyna
              </button>
              <button 
                onClick={() => setStage(GameStage.LEADERBOARD)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl font-bold text-sm transition shadow-md shadow-emerald-500/10"
                id="result_leaderboard_button"
              >
                Lider Tablosu
              </button>
            </div>
          </div>
        )}

        {/* LEADERBOARD STAGE */}
        {stage === GameStage.LEADERBOARD && (
          <div className="glass-card p-6 md:p-8 rounded-2xl shadow-2xl space-y-6" id="leaderboard_view">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 tracking-tight">
                <span className="text-3xl text-yellow-500">🏆</span> Onur Tablosu
              </h2>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">TOP 10 LİSTESİ</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Oyun puanları her bir bağlantı adımını temsil etmektedir. Puanı daha düşük olan oyuncular daha kısa zincirlerle sonuca ulaşan ustaları gösterir.
            </p>

            <div className="space-y-3">
              {(() => {
                const displayedLeaderboard = [...leaderboard, ...tempEntries]
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 10);

                return displayedLeaderboard.length > 0 ? (
                  displayedLeaderboard.map((item, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border transition ${
                        item.nickname === nickname 
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md' 
                          : 'bg-slate-900/40 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black w-6 text-center ${
                          i === 0 ? 'text-yellow-500 text-lg' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-extrabold text-slate-200">{item.nickname}</p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({item.playCount || 1}. oynayışta)
                            </span>
                            {item.isTemporary && (
                              <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase font-mono px-1.5 rounded">Geçici</span>
                            )}
                            {item.nickname === nickname && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono px-1.5 rounded">Siz</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">{item.date}</p>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right mt-2 sm:mt-0 flex sm:flex-col justify-between items-center sm:items-end gap-1 border-t border-slate-800/50 sm:border-0 pt-2 sm:pt-0">
                        <p className="text-sm font-mono text-emerald-400 font-black">{item.score} <span className="text-xs text-slate-500 font-normal">puan</span></p>
                        <p className="text-[9px] text-slate-500 italic max-w-xs truncate">
                          {item.chain ? item.chain.join(" → ") : ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-16 bg-slate-900/20 rounded-xl border border-slate-900">
                    <span className="text-3xl block mb-2">🎬</span>
                    Henüz bir rekor kaydedilmedi. İlk kazanan sen ol!
                  </div>
                );
              })()}
            </div>

            <button 
              onClick={() => {
                setErrorMsg('');
                setInfoMsg('');
                setStage(GameStage.HOME);
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-sm"
              id="back_to_homepage_button"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-600 text-[11px] border-t border-slate-900 space-y-1">
        <div>CineLink © 2026 Türkiye Sinema Bağlantı Oyunu</div>
        <div>Yerel Veri Koruma Standartları ile Tarayıcı Tabanlı Güvenceli Altyapı</div>
      </footer>
    </div>
  );
};

export default App;
