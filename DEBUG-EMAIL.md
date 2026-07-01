# Instrucciones para Debug del Email

## Pasos a Seguir

1. **Abre la consola del navegador**
   - Presiona F12
   - Ve a la pestaña "Console"

2. **Recarga la página de login**
   - Presiona Ctrl+R o F5

3. **Escribe el email con el punto**
   - Email: `emendoza.ge@gmail.com`
   - Contraseña: `Twinc3pt.`

4. **Observa los logs mientras escribes**
   - Verás logs como: `Email input changed: e Length: 1`
   - Cada vez que escribas un carácter

5. **Haz clic en "Iniciar Sesión"**

6. **Copia TODOS los logs de la consola**
   - Incluye desde el primer log hasta el último
   - Especialmente los que dicen:
     - `Email value:`
     - `Email length:`
     - `Email characters:`
     - `Attempting login with:`

## Qué Buscar

Los logs mostrarán:
- ✅ Si el punto está presente: verás `'.'` en la lista de caracteres
- ❌ Si el punto falta: no verás `'.'` en la lista
- 🔍 El código ASCII del punto es `46`

## Ejemplo de Log Esperado

```
Email value: emendoza.ge@gmail.com
Email length: 22
Email characters: [
  "0: 'e' (101)",
  "1: 'm' (109)",
  ...
  "8: '.' (46)",  ← El punto debe estar aquí
  ...
]
```

Si el punto NO aparece en la posición 8, entonces se está perdiendo en el frontend.
