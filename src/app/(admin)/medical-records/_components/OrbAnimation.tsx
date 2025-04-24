"use client";

import { useEffect, useRef } from "react";

const PolyAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Variables para la animación
    let rotationAngleX = 0.5;
    let rotationAngleY = 0.5;
    let targetRotationX = 0.5;
    let targetRotationY = 0.5;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let autoRotate = true;
    let lastInteractionTime = 0;

    // Asegurar que el canvas tenga el tamaño correcto
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 200; // Altura fija
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Función para calcular el tamaño óptimo del icosaedro basado en el ancho del canvas
    const getOptimalScale = () => {
      // Base scale es el tamaño base para un canvas de 320px de ancho
      const baseScale = 25; // Reducido a la mitad del valor anterior (45)
      const baseWidth = 320;

      // Ajustar el tamaño proporcionalmente
      const scale = Math.min((canvas.width / baseWidth) * baseScale, 35); // Límite máximo también reducido

      // Asegurar un tamaño mínimo
      return Math.max(scale, 15); // Tamaño mínimo también reducido
    };

    // Eventos del ratón para interacción
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.offsetX;
      lastMouseY = e.offsetY;
      autoRotate = false; // Desactivar auto-rotación mientras se arrastra
      lastInteractionTime = Date.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.offsetX - lastMouseX;
      const deltaY = e.offsetY - lastMouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      lastMouseX = e.offsetX;
      lastMouseY = e.offsetY;
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
        lastMouseY = touch.clientY - rect.top;
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
        const y = touch.clientY - rect.top;

        const deltaX = x - lastMouseX;
        const deltaY = y - lastMouseY;

        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;

        lastMouseX = x;
        lastMouseY = y;
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

    // Crear un icosaedro (20 caras triangulares)
    const createIcosahedron = () => {
      const phi = (1 + Math.sqrt(5)) / 2; // Proporción áurea
      const scale = getOptimalScale(); // Tamaño adaptativo

      // 12 vértices del icosaedro regular
      const vertices = [
        [-1, phi, 0],
        [1, phi, 0],
        [-1, -phi, 0],
        [1, -phi, 0],
        [0, -1, phi],
        [0, 1, phi],
        [0, -1, -phi],
        [0, 1, -phi],
        [phi, 0, -1],
        [phi, 0, 1],
        [-phi, 0, -1],
        [-phi, 0, 1],
      ].map((v) => v.map((coord) => coord * scale));

      // 20 caras triangulares
      const faces = [
        // 5 caras alrededor del punto 0
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        // 5 caras adyacentes a las anteriores
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        // 5 caras alrededor del punto 3
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        // 5 caras adyacentes a las anteriores
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1],
      ];

      return { vertices, faces };
    };

    // Creamos el icosaedro
    const icosahedron = {
      ...createIcosahedron(),
      scale: getOptimalScale(),
    };

    // Función para rotar un punto en 3D
    const rotatePoint = (point: number[], angleX: number, angleY: number): number[] => {
      const [x, y, z] = point;

      // Rotación en X
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotación en Y
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const x1 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      return [x1, y1, z2];
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

    // Colores del cel shading (invertidos y suavizados)
    const darkestShade = "#333333"; // Gris muy oscuro
    const darkShade = "#555555"; // Gris oscuro
    const mediumShade = "#777777"; // Gris medio
    const lightShade = "#999999"; // Gris claro
    const lightestShade = "#bbbbbb"; // Gris muy claro

    // Función para calcular la iluminación en estilo cel shading avanzado
    const calculateCelShading = (
      face: number[],
      vertices: number[][],
      lightDirection: number[],
      secondLight: number[]
    ) => {
      // Calcular el vector normal de la cara
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
      const nnx = nx / length;
      const nny = ny / length;
      const nnz = nz / length;

      // Producto punto con la dirección de la luz principal
      const dot = nnx * lightDirection[0] + nny * lightDirection[1] + nnz * lightDirection[2];

      // Producto punto con la luz secundaria (luz de relleno)
      const dot2 = nnx * secondLight[0] + nny * secondLight[1] + nnz * secondLight[2];

      // Solo mostrar caras que miran hacia el espectador (culling)
      if (nnz < 0) {
        // Cel Shading con 5 niveles de iluminación
        if (dot > 0.7) {
          return darkestShade;
        } else if (dot > 0.4) {
          return darkShade;
        } else if (dot > 0.1) {
          return mediumShade;
        } else if (dot > -0.2 || dot2 > 0.3) {
          // Incluir la luz secundaria para eliminar zonas demasiado oscuras
          return lightShade;
        } else {
          return lightestShade;
        }
      }

      return null; // No renderizar esta cara
    };

    const drawIcosahedron = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Recalcular el icosaedro si cambió el tamaño del canvas
      const currentScale = getOptimalScale();
      if (currentScale !== icosahedron.scale) {
        icosahedron.vertices = createIcosahedron().vertices;
        icosahedron.scale = currentScale;
      }

      // Limpiar canvas con fondo transparente
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Suavizar la transición de la rotación para un movimiento más natural
      rotationAngleX += (targetRotationX - rotationAngleX) * 0.1;
      rotationAngleY += (targetRotationY - rotationAngleY) * 0.1;

      // Si está en modo auto-rotación, seguir rotando automáticamente
      if (autoRotate) {
        targetRotationY += 0.03; // Velocidad de rotación
        targetRotationX = Math.sin(targetRotationY * 0.5) * 0.3 + 0.5; // Movimiento ondulante en X
      }

      // Dirección de la luz principal
      const lightDirection = [0.5, -0.7, 0.5];
      // Luz secundaria suave (luz de relleno)
      const secondLight = [-0.2, 0.3, 0.3];

      // Rotar los vértices del icosaedro
      const rotatedVertices = icosahedron.vertices.map((v) => rotatePoint(v, rotationAngleX, rotationAngleY));

      // Proyectar los vértices al espacio 2D
      const projectedVertices = rotatedVertices.map((v) => projectPoint(v, centerX, centerY));

      // Ordenar caras por profundidad (painter's algorithm)
      const sortedFaces = [...icosahedron.faces]
        .map((face) => ({
          face,
          depth: (rotatedVertices[face[0]][2] + rotatedVertices[face[1]][2] + rotatedVertices[face[2]][2]) / 3,
        }))
        .sort((a, b) => a.depth - b.depth);

      // Dibujar las caras
      for (const { face } of sortedFaces) {
        const color = calculateCelShading(face, rotatedVertices, lightDirection, secondLight);

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

          // Aplicar color cel-shading
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
    };

    // Iniciar animación
    const animate = () => {
      drawIcosahedron();
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
        className="w-full h-[200px] cursor-grab active:cursor-grabbing"
        style={{ display: "block" }}
      />
    </div>
  );
};

export default PolyAnimation;
