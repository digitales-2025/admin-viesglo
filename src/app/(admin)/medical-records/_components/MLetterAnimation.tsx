"use client";

import { useEffect, useRef } from "react";

const MLetterAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Variables para la animación
    let rotationAngleY = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let autoRotate = true;
    let lastInteractionTime = 0;

    // Asegurar que el canvas tenga el tamaño correcto
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 150; // Altura reducida
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Función para calcular el tamaño óptimo de la letra M basado en el ancho del canvas
    const getOptimalScale = () => {
      const baseScale = 10; // Tamaño base más pequeño
      const baseWidth = 320;

      // Ajustar el tamaño proporcionalmente
      const scale = Math.min((canvas.width / baseWidth) * baseScale, 18);

      // Asegurar un tamaño mínimo
      return Math.max(scale, 8);
    };

    // Eventos del ratón para interacción
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.offsetX;
      autoRotate = false; // Desactivar auto-rotación mientras se arrastra
      lastInteractionTime = Date.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.offsetX - lastMouseX;

      targetRotationY += deltaX * 0.01;

      lastMouseX = e.offsetX;
      lastInteractionTime = Date.now();
    };

    const handleMouseUp = () => {
      isDragging = false;
      // Reactivar la auto-rotación después de 1 segundo sin interacción
      setTimeout(() => {
        if (Date.now() - lastInteractionTime >= 1000) {
          autoRotate = true;
        }
      }, 1000);
    };

    const handleMouseOut = () => {
      isDragging = false;
      // Reactivar la auto-rotación después de 1 segundo sin interacción
      setTimeout(() => {
        if (Date.now() - lastInteractionTime >= 1000) {
          autoRotate = true;
        }
      }, 1000);
    };

    // Evento táctil para dispositivos móviles
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        lastMouseX = touch.clientX - rect.left;
        isDragging = true;
        autoRotate = false;
        lastInteractionTime = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;

        const deltaX = x - lastMouseX;

        targetRotationY += deltaX * 0.01;

        lastMouseX = x;
        lastInteractionTime = Date.now();
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      // Reactivar la auto-rotación después de 1 segundo sin interacción
      setTimeout(() => {
        if (Date.now() - lastInteractionTime >= 1000) {
          autoRotate = true;
        }
      }, 1000);
    };

    // Agregar eventos
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);

    // Crear vértices y caras para una letra M en 3D simplificada
    const createMLetter = () => {
      const scale = getOptimalScale();
      const thickness = scale * 0.5; // Grosor de la letra
      const mainColor = "#ff9800"; // Color naranja

      // Vértices base para la cara frontal de la M
      const frontVertices = [
        // Pata izquierda
        [-2.5, 2.0, 0], // 0 - arriba izquierda
        [-1.7, 2.0, 0], // 1 - arriba derecha
        [-1.7, -2.0, 0], // 2 - abajo derecha
        [-2.5, -2.0, 0], // 3 - abajo izquierda

        // Diagonal izquierda (hasta el centro)
        [-1.7, -2.0, 0], // 4 - abajo izquierda
        [-0.8, -2.0, 0], // 5 - abajo derecha
        [0.0, 1.0, 0], // 6 - arriba centro (punto común)
        [-0.8, 1.0, 0], // 7 - arriba izquierda

        // Diagonal derecha (desde el centro)
        [0.0, 1.0, 0], // 8 - arriba centro (punto común)
        [0.8, 1.0, 0], // 9 - arriba derecha
        [1.7, -2.0, 0], // 10 - abajo derecha
        [0.8, -2.0, 0], // 11 - abajo izquierda

        // Pata derecha
        [1.7, 2.0, 0], // 12 - arriba izquierda
        [2.5, 2.0, 0], // 13 - arriba derecha
        [2.5, -2.0, 0], // 14 - abajo derecha
        [1.7, -2.0, 0], // 15 - abajo izquierda
      ].map((v) => v.map((coord) => coord * scale));

      // Crear vértices traseros (desplazados por el grosor)
      const backVertices = frontVertices.map((v) => [v[0], v[1], v[2] - thickness]);

      // Combinar todos los vértices
      const vertices = [...frontVertices, ...backVertices];

      // Caras trianguladas
      const faces = [
        // Cara frontal - pata izquierda (2 triángulos)
        [0, 1, 2],
        [0, 2, 3],

        // Cara frontal - diagonal izquierda (2 triángulos)
        [4, 5, 6],
        [4, 6, 7],

        // Cara frontal - diagonal derecha (2 triángulos)
        [8, 9, 10],
        [8, 10, 11],

        // Cara frontal - pata derecha (2 triángulos)
        [12, 13, 14],
        [12, 14, 15],

        // Cara trasera - pata izquierda (2 triángulos)
        [16 + 3, 16 + 2, 16 + 1],
        [16 + 3, 16 + 1, 16 + 0],

        // Cara trasera - diagonal izquierda (2 triángulos)
        [16 + 7, 16 + 6, 16 + 5],
        [16 + 7, 16 + 5, 16 + 4],

        // Cara trasera - diagonal derecha (2 triángulos)
        [16 + 11, 16 + 10, 16 + 9],
        [16 + 11, 16 + 9, 16 + 8],

        // Cara trasera - pata derecha (2 triángulos)
        [16 + 15, 16 + 14, 16 + 13],
        [16 + 15, 16 + 13, 16 + 12],

        // Caras laterales - pata izquierda
        [0, 3, 16 + 3],
        [0, 16 + 3, 16 + 0], // izquierda externa
        [1, 0, 16 + 0],
        [1, 16 + 0, 16 + 1], // arriba
        [2, 1, 16 + 1],
        [2, 16 + 1, 16 + 2], // derecha interna
        [3, 2, 16 + 2],
        [3, 16 + 2, 16 + 3], // abajo

        // Caras laterales - diagonal izquierda
        [4, 7, 16 + 7],
        [4, 16 + 7, 16 + 4], // izquierda
        [7, 6, 16 + 6],
        [7, 16 + 6, 16 + 7], // arriba
        [6, 5, 16 + 5],
        [6, 16 + 5, 16 + 6], // derecha
        [5, 4, 16 + 4],
        [5, 16 + 4, 16 + 5], // abajo

        // Caras laterales - diagonal derecha
        [8, 11, 16 + 11],
        [8, 16 + 11, 16 + 8], // izquierda
        [9, 8, 16 + 8],
        [9, 16 + 8, 16 + 9], // arriba
        [10, 9, 16 + 9],
        [10, 16 + 9, 16 + 10], // derecha
        [11, 10, 16 + 10],
        [11, 16 + 10, 16 + 11], // abajo

        // Caras laterales - pata derecha
        [12, 15, 16 + 15],
        [12, 16 + 15, 16 + 12], // izquierda interna
        [13, 12, 16 + 12],
        [13, 16 + 12, 16 + 13], // arriba
        [14, 13, 16 + 13],
        [14, 16 + 13, 16 + 14], // derecha externa
        [15, 14, 16 + 14],
        [15, 16 + 14, 16 + 15], // abajo
      ];

      // Etiquetas para las caras (para diferenciar las caras internas)
      const faceTypes = faces.map((_, index) => {
        // Caras interiores de la M (todos los lados que miran hacia dentro)
        if (
          // Cara lateral derecha de la pata izquierda
          (index >= 16 && index <= 17) ||
          // Cara lateral izquierda de la pata derecha
          (index >= 32 && index <= 33) ||
          // Cara lateral derecha de la diagonal izquierda
          (index >= 22 && index <= 23) ||
          // Cara lateral izquierda de la diagonal derecha
          (index >= 26 && index <= 27)
        ) {
          return "inner";
        }
        return "normal";
      });

      return { vertices, faces, faceTypes, scale, color: mainColor };
    };

    // Creamos la letra M
    const mLetter = {
      ...createMLetter(),
      scale: getOptimalScale(),
    };

    // Función para rotar un punto solo en eje Y
    const rotatePointY = (point: number[], angleY: number): number[] => {
      const [x, y, z] = point;

      // Rotación en Y
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const x1 = x * cosY + z * sinY;
      const z2 = -x * sinY + z * cosY;

      return [x1, y, z2];
    };

    // Función para proyectar un punto 3D en el plano 2D
    const projectPoint = (point: number[], centerX: number, centerY: number): number[] => {
      const [x, y, z] = point;
      const depth = 400; // Distancia del observador a la pantalla
      const fov = depth / (depth + z);

      return [
        centerX + x * fov,
        centerY + y * fov,
        z, // Devolvemos Z para cálculos de iluminación
      ];
    };

    // Colores fijos
    const ORANGE = "#ff9800"; // Color naranja principal
    const BLACK = "#000000"; // Negro para los bordes interiores

    // Determinar el color de una cara según su tipo
    const getFaceColor = (face: number[], vertices: number[][], faceType: string): string | null => {
      // Calcular el vector normal de la cara para culling
      const v0 = vertices[face[0]];
      const v1 = vertices[face[1]];
      const v2 = vertices[face[2]];

      // Vectores de los lados del triángulo
      const ax = v1[0] - v0[0];
      const ay = v1[1] - v0[1];
      const az = v1[2] - v0[2];

      const bx = v2[0] - v0[0];
      const by = v2[1] - v0[1];
      const bz = v2[2] - v0[2];

      // Producto cruz para obtener la normal
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;

      // Normalizar
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const nnz = nz / length;

      // Solo mostrar caras que miran hacia el espectador (culling)
      if (nnz < 0) {
        return faceType === "inner" ? BLACK : ORANGE;
      }

      return null; // No renderizar esta cara
    };

    const drawMLetter = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Recalcular la letra M si cambió el tamaño del canvas
      const currentScale = getOptimalScale();
      if (currentScale !== mLetter.scale) {
        const newM = createMLetter();
        mLetter.vertices = newM.vertices;
        mLetter.faceTypes = newM.faceTypes;
        mLetter.scale = currentScale;
      }

      // Limpiar canvas con fondo transparente
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Suavizar la transición de la rotación para un movimiento más natural
      rotationAngleY += (targetRotationY - rotationAngleY) * 0.1;

      // Si está en modo auto-rotación, seguir rotando automáticamente
      if (autoRotate) {
        targetRotationY += 0.02; // Velocidad de rotación
      }

      // Rotar los vértices de la letra M (solo en eje Y)
      const rotatedVertices = mLetter.vertices.map((v) => rotatePointY(v, rotationAngleY));

      // Proyectar los vértices al espacio 2D
      const projectedVertices = rotatedVertices.map((v) => projectPoint(v, centerX, centerY));

      // Ordenar caras por profundidad (painter's algorithm)
      const sortedFaces = [...mLetter.faces]
        .map((face, index) => ({
          face,
          type: mLetter.faceTypes[index],
          depth: (rotatedVertices[face[0]][2] + rotatedVertices[face[1]][2] + rotatedVertices[face[2]][2]) / 3,
        }))
        .sort((a, b) => a.depth - b.depth);

      // Dibujar las caras
      ctx.lineWidth = 0; // Eliminar bordes visibles

      for (const { face, type } of sortedFaces) {
        const color = getFaceColor(face, rotatedVertices, type);

        if (color) {
          const proj0 = projectedVertices[face[0]];
          const proj1 = projectedVertices[face[1]];
          const proj2 = projectedVertices[face[2]];

          // Dibujar triángulo con relleno sólido
          ctx.beginPath();
          ctx.moveTo(proj0[0], proj0[1]);
          ctx.lineTo(proj1[0], proj1[1]);
          ctx.lineTo(proj2[0], proj2[1]);
          ctx.closePath();

          // Aplicar color sólido sin líneas entre segmentos
          ctx.fillStyle = color;
          ctx.strokeStyle = color; // Mismo color para el borde
          ctx.fill();
          ctx.stroke(); // Dibujar el borde del mismo color para evitar líneas blancas
        }
      }
    };

    // Iniciar animación
    const animate = () => {
      drawMLetter();
      requestAnimationFrame(animate);
    };

    animate();

    // Limpieza
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseOut);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-[150px] cursor-grab active:cursor-grabbing"
        style={{ display: "block" }}
      />
    </div>
  );
};

export default MLetterAnimation;
