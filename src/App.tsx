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
  OperationType,
  User
} from './services/firebase';

import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { HomeView } from './components/HomeView';
import { GameBoard } from './components/GameBoard';
import { ResultView } from './components/ResultView';
import { LeaderboardView } from './components/LeaderboardView';
import { CookieBanner } from './components/CookieBanner';

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
  const [user, setUser] = useState<User | null>(null);
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
        // Fallback to local guest session playCount
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
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          docs.push({
            id: docSnap.id,
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
      console.error("Could not fetch leaderboard data:", e);
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
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      setInfoMsg(`Başarıyla giriş yapıldı: ${loggedInUser.displayName}`);
      await loadLeaderboardData();
    } catch (e: unknown) {
      console.error("Sign in error:", e);
      const err = e as { code?: string; message?: string };
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Giriş penceresi tarayıcı tarafından engellendi. Lütfen pop-up engelleyicinizi devre dışı bırakın veya uygulamayı yeni sekmede açın.');
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Giriş penceresi kapatıldı veya tarayıcınızın çerez/iframe kısıtlamaları nedeniyle engellendi.');
      } else {
        setErrorMsg('Google ile giriş yapılırken bir hata oluştu: ' + (err.message || String(e)));
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
    } catch {
      setErrorMsg('Çıkış yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const saveToLeaderboard = async (finalChain: LinkStep[], score: number) => {
    const today = new Date().toLocaleDateString('tr-TR');
    const safeNick = nickname.trim().slice(0, 50) || 'Oyuncu';
    const safeScore = Math.max(0, Math.min(10000, Math.round(score)));
    
    if (user) {
      try {
        const currentPlay = playCount;
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            await updateDoc(userRef, { playCount: currentPlay });
          } else {
            await setDoc(userRef, { playCount: currentPlay });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }

        setPlayCount(currentPlay + 1);

        const newEntry = {
          nickname: safeNick,
          score: safeScore,
          date: today,
          chain: finalChain.slice(0, 30).map(c => c.name.slice(0, 80)),
          playCount: currentPlay,
          userId: user.uid
        };

        try {
          await addDoc(collection(db, 'leaderboard'), newEntry);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'leaderboard');
        }
        setInfoMsg("Tebrikler! Rekorunuz Google Hesabınızla kalıcı olarak kaydedildi.");
        await loadLeaderboardData();
      } catch (e: unknown) {
        console.error("Firestore saveToLeaderboard error:", e);
        const errMsg = e instanceof Error ? e.message : String(e);
        setErrorMsg("Rekor kaydedilirken bir hata oluştu: " + errMsg);
      }
    } else {
      // Unauthenticated -> Temporary list only. Cleared on refresh.
      const currentPlay = playCount;
      const tempEntry: LeaderboardEntry = {
        nickname: safeNick,
        score: safeScore,
        date: today,
        chain: finalChain.slice(0, 30).map(c => c.name.slice(0, 80)),
        playCount: currentPlay,
        isTemporary: true
      };
      
      setTempEntries(prev => [...prev, tempEntry]);
      setPlayCount(prev => prev + 1);
      setInfoMsg("Tebrikler! Rekorunuz geçici olarak listeye eklendi (Giriş yapılmadığı için sonraki oturumda sıfırlanacaktır).");
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
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Meydan okuma yüklenirken bir bağlantı hatası oluştu, lütfen tekrar deneyin.';
      setErrorMsg(errMsg);
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
        const isNextMovie = gameState.currentChain.length % 2 !== 0;
        const newStep: LinkStep = { 
          type: isNextMovie ? 'MOVIE' : 'PERSON', 
          name: proposedLink 
        };
        const newChain = [...gameState.currentChain, newStep];
        
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
    } catch {
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
    } catch {
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
      let totalScore = userSteps * 25;
      if (userSteps > result.shortest && result.shortest > 0) {
        totalScore += 50;
      }

      const finalState: GameState = {
        ...gameState,
        currentChain: finalChain,
        isFinished: true,
        score: totalScore,
        shortestPathSteps: result.shortest
      };
      
      setGameState(finalState);
      await saveToLeaderboard(finalChain, totalScore);
      setStage(GameStage.RESULT);
    } catch {
      setStage(GameStage.RESULT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-radial from-emerald-950/20 via-blue-950/5 to-transparent pointer-events-none -z-10" />

      {/* Modular Header */}
      <AppHeader
        user={user}
        loading={loading}
        stage={stage}
        onSignOut={handleSignOut}
        onGoogleSignIn={handleGoogleSignIn}
        onGoHome={() => {
          setErrorMsg('');
          setInfoMsg('');
          setStage(GameStage.HOME);
        }}
        onGoLeaderboard={() => setStage(GameStage.LEADERBOARD)}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center animate-fade-in" id="main_game_container">
        {stage === GameStage.HOME && (
          <HomeView
            user={user}
            nickname={nickname}
            playCount={playCount}
            loading={loading}
            errorMsg={errorMsg}
            acceptedKVKK={acceptedKVKK}
            onChangeNickname={setNickname}
            onAcceptKVKK={handleAcceptKVKK}
            onGoogleSignIn={handleGoogleSignIn}
            onStartNewGame={startNewGame}
          />
        )}

        {stage === GameStage.PLAYING && gameState && (
          <GameBoard
            gameState={gameState}
            inputVal={inputVal}
            loading={loading}
            errorMsg={errorMsg}
            infoMsg={infoMsg}
            onChangeInput={setInputVal}
            onAddLink={handleAddLink}
            onDirectFinish={checkDirectFinish}
          />
        )}

        {stage === GameStage.RESULT && gameState && (
          <ResultView
            gameState={gameState}
            onPlayAgain={() => setStage(GameStage.HOME)}
            onGoLeaderboard={() => setStage(GameStage.LEADERBOARD)}
          />
        )}

        {stage === GameStage.LEADERBOARD && (
          <LeaderboardView
            leaderboard={leaderboard}
            tempEntries={tempEntries}
            nickname={nickname}
            onBackToHome={() => {
              setErrorMsg('');
              setInfoMsg('');
              setStage(GameStage.HOME);
            }}
          />
        )}
      </main>

      {/* Modular Footer */}
      <AppFooter />

      {/* KVKK 2026 & AdSense Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
};

export default App;
