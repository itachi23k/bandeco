import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isExpired: boolean;
  isAuthorized: boolean;
  licenseError: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserValidity: (uid: string, newValidUntil: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  // Calculate validity date
  const checkValidity = (profile: UserProfile | null) => {
    if (!profile || !profile.validUntil) return false;
    const now = new Date();
    const validDate = new Date(profile.validUntil);
    validDate.setHours(23, 59, 59, 999);
    return now > validDate;
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        setLoading(true);
        const userRef = doc(db, 'users', user.uid);
        
        // Listen to profile updates in real-time with offline fallback
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            const expired = checkValidity(profile);
            setUserProfile(profile);
            setIsExpired(expired);
            setIsAuthorized(!expired);
            if (expired) {
              setLicenseError(`Sua licença de uso venceu em ${profile.validUntil}. Solicite a renovação ao administrador.`);
            } else {
              setLicenseError(null);
            }
            // Cache profile locally for seamless offline access in the field
            try {
              localStorage.setItem(`cached_profile_${user.uid}`, JSON.stringify(profile));
            } catch (e) {
              console.warn('Could not save profile to localStorage:', e);
            }
          } else {
            // Check if there's a cached profile from previous online session
            const cached = localStorage.getItem(`cached_profile_${user.uid}`);
            if (cached) {
              try {
                const profile = JSON.parse(cached) as UserProfile;
                const expired = checkValidity(profile);
                setUserProfile(profile);
                setIsExpired(expired);
                setIsAuthorized(!expired);
                setLicenseError(expired ? `Sua licença de uso venceu em ${profile.validUntil}.` : null);
              } catch (e) {
                setUserProfile(null);
                setIsAuthorized(false);
                setLicenseError('Conta não cadastrada na coleção de usuários do administrador.');
              }
            } else {
              setUserProfile(null);
              setIsExpired(false);
              setIsAuthorized(false);
              setLicenseError('Conta não cadastrada na coleção de usuários do administrador. O aplicativo está indisponível para uso.');
            }
          }
          setLoading(false);
        }, (err) => {
          console.warn('Erro ao verificar licença no Firestore (tentando cache local):', err);
          const cached = localStorage.getItem(`cached_profile_${user.uid}`);
          if (cached) {
            try {
              const profile = JSON.parse(cached) as UserProfile;
              const expired = checkValidity(profile);
              setUserProfile(profile);
              setIsExpired(expired);
              setIsAuthorized(!expired);
              setLicenseError(expired ? `Sua licença de uso venceu em ${profile.validUntil}.` : null);
            } catch (e) {
              setUserProfile(null);
              setIsAuthorized(false);
              setLicenseError('Não foi possível verificar a licença. Conecte-se à internet para o primeiro acesso.');
            }
          } else {
            setUserProfile(null);
            setIsAuthorized(false);
            setLicenseError('Não foi possível verificar a licença no servidor Firestore. Conecte-se à internet para validar seu acesso.');
          }
          setLoading(false);
        });

      } else {
        setUserProfile(null);
        setIsExpired(false);
        setIsAuthorized(false);
        setLicenseError(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const updateUserValidity = async (uid: string, newValidUntil: string) => {
    const targetRef = doc(db, 'users', uid);
    await setDoc(targetRef, { validUntil: newValidUntil }, { merge: true });
    if (userProfile && userProfile.uid === uid) {
      const updated = { ...userProfile, validUntil: newValidUntil };
      const expired = checkValidity(updated);
      setUserProfile(updated);
      setIsExpired(expired);
      setIsAuthorized(!expired);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isExpired,
        isAuthorized,
        licenseError,
        login,
        logout,
        updateUserValidity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

