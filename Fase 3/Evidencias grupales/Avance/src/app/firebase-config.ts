import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWD_S-ixA0gQn6pWEMQl81Juvj6FlU1F0",
    authDomain: "sistema-unidad-terrritorial.firebaseapp.com",
    projectId: "sistema-unidad-terrritorial",
    storageBucket: "sistema-unidad-terrritorial.appspot.com",
    messagingSenderId: "110154609263",
    appId: "1:110154609263:web:07ffec8194534c5fca539a"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de autenticación
export const auth = getAuth(app);
