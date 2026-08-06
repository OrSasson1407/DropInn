import { auth } from '../../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

const googleProvider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

