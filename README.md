# Frayluz - Sistema de pantallas

Sistema para manejar las 3 pantallas (TV) de la panadería Frayluz desde una sola PC.
Subís videos o fotos con su precio desde el panel, y cada pantalla los muestra sola,
en forma independiente.

## Qué necesitás instalado antes de arrancar

Solo **Node.js** (versión 18 o más nueva). Es gratis, se descarga de:
https://nodejs.org (bajá la versión "LTS")

Para saber si ya lo tenés instalado, abrí una terminal (o "Símbolo del sistema" en
Windows) y escribí:

```
node -v
```

Si te muestra un número (por ejemplo `v20.11.0`), ya está instalado.

## Cómo arrancarlo (la primera vez)

1. Descomprimí esta carpeta en tu PC, en el lugar donde la vayas a dejar corriendo
   (por ejemplo el Escritorio, o una carpeta "Frayluz").
2. Abrí una terminal **dentro de esa carpeta**.
   - Windows: abrí la carpeta en el Explorador, hacé clic en la barra de direcciones,
     escribí `cmd` y apretá Enter.
   - Mac: clic derecho en la carpeta, "Nueva terminal en la carpeta" (o abrí la
     Terminal y escribí `cd ` y arrastrá la carpeta adentro).
3. Instalá lo necesario (solo la primera vez, tarda un minuto):

   ```
   npm install
   ```

4. Arrancá el sistema:

   ```
   npm start
   ```

5. Vas a ver un mensaje como este:

   ```
   Panel de administracion:  http://localhost:4000/admin
   Pantalla 1:               http://localhost:4000/screen/1
   Pantalla 2:               http://localhost:4000/screen/2
   Pantalla 3:               http://localhost:4000/screen/3
   ```

Dejá esa terminal abierta: mientras esté abierta, el sistema sigue funcionando.
Si la cerrás, las pantallas dejan de actualizarse (pero sí queda todo guardado
para la próxima vez que lo abras).

## Cómo probarlo con tus 2 monitores

1. Con el sistema arrancado (paso anterior), abrí un navegador (Chrome, Edge, etc.)
   y entrá a `http://localhost:4000/admin`. Ese es el panel donde subís contenido
   y ponés los precios.
2. Abrí OTRA ventana del navegador, llevala al Monitor 1, y poné en pantalla
   completa (tecla F11) la dirección `http://localhost:4000/screen/1`.
3. Abrí OTRA ventana más, llevala al Monitor 2, y poné en pantalla completa
   la dirección `http://localhost:4000/screen/2`.
4. Volvé al panel de administración, elegí la pestaña "Pantalla 1", subí una
   foto o un video, ponele nombre y precio, y hacé clic en "Subir a esta
   pantalla". En unos segundos vas a ver que aparece solo en el Monitor 1.
5. Hacé lo mismo con la pestaña "Pantalla 2" para el Monitor 2.

Cada pantalla revisa sola cada 10 segundos si hay algo nuevo, así que no hace
falta refrescar nada a mano.

## Cómo se usa el panel

- **Pantallas**: elegís la pestaña (Pantalla 1, 2 o 3), subís un video o una
  foto arrastrándolo o haciendo clic en el recuadro punteado, le ponés nombre
  y precio, y lo publicás. A la derecha ves la vista previa en vivo de cómo
  se ve en la TV.
- Podés cambiar el precio de algo que ya subiste escribiendo el número nuevo
  en la lista; se actualiza solo, sin volver a subir el archivo.
- **Ajustes**: color y posición de la etiqueta de precio.

## Cuando esté listo para el local real (las 3 TV de verdad)

En vez de tus 2 monitores, en la panadería vas a necesitar:

- La PC (que ya tienen) corriendo este sistema todo el tiempo, conectada a la
  red WiFi o de cable del local.
- Un dispositivo por cada TV (Android TV Box, Fire TV Stick, o similar),
  conectado por HDMI a esa TV y a la misma red WiFi.
- En cada dispositivo, un navegador en modo pantalla completa apuntando a la
  dirección de esa pantalla, pero usando la IP de la PC en la red local en vez
  de "localhost". Por ejemplo, si la PC tiene la IP `192.168.1.50`, la Pantalla 2
  se abre en `http://192.168.1.50:4000/screen/2`.
- Para saber la IP de tu PC en la red: en Windows, `ipconfig` en la terminal
  (buscá "Dirección IPv4"); en Mac, Preferencias del Sistema > Red.

## Notas técnicas

- Los archivos que subís quedan guardados en la carpeta `uploads/`.
- Los datos (qué pantalla tiene qué, precios, ajustes) se guardan en
  `data/screens.json`. Si querés hacer una copia de seguridad, alcanza con
  copiar las carpetas `uploads/` y `data/`.
- El puerto por defecto es el 4000. Si ya lo estás usando para otra cosa,
  podés arrancar con otro puerto así: `PORT=5000 npm start` (Mac/Linux) o
  `set PORT=5000 && npm start` (Windows).
