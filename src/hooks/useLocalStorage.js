import { useState, useEffect, useRef } from 'react';

export const useLocalStorage = (key, initialValue) => {
    const isInitialized = useRef(false);

    const [value, setValue] = useState(() => {
        try {
            const jsonValue = localStorage.getItem(key);
            if (jsonValue != null) return JSON.parse(jsonValue);
        } catch (e) {
            console.error(`Error leyendo localStorage "${key}":`, e);
        }
        return initialValue;
    });

    // Solo guardar en localStorage después del montaje inicial
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error escribiendo localStorage "${key}":`, e);
        }
    }, [key, value]);

    // Guardar valor inicial si localStorage estaba vacío
    useEffect(() => {
        try {
            const existing = localStorage.getItem(key);
            if (existing == null) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (e) {
            console.error(`Error inicializando localStorage "${key}":`, e);
        }
        isInitialized.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [value, setValue];
};
