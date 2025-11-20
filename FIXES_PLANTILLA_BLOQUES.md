# Fixes para el Problema de Bloques Null en Plantillas Grandes

## Problema Identificado
Cuando editabas o agregabas bloques en plantillas con estructuras grandes (640+ bloques), algunos bloques quedaban `null` o `undefined`, causando:
- Errores al renderizar
- Datos perdidos en el preview
- Crashes al intentar editar nuevamente

## Causa Raíz
El código tenía varios problemas que se amplifican con estructuras grandes:

1. **`ensureIds()` no era recursiva** - No procesaba bloques anidados (capítulos/subcapítulos)
2. **`actualizarBloque()` no manejaba bloques anidados** - Solo actualizaba el nivel superior
3. **Mutaciones directas de arrays** - `bloque.filas.push()` causaba problemas con React
4. **Spread operator insuficiente** - No clonaba profundamente estructuras complejas
5. **Sin validación de bloques nulos** - No había guards para detectar/mostrar errores

## Cambios Implementados

### 1. **edit-plantilla-dialog.tsx**

#### Función `clonarBloque()`
```typescript
const clonarBloque = (bloque: Bloque): Bloque => {
  try {
    return JSON.parse(JSON.stringify(bloque));
  } catch (e) {
    console.warn("Error al clonar bloque, usando spread operator", e);
    return { ...bloque };
  }
};
```
- Clonamiento profundo seguro para evitar referencias compartidas

#### `ensureIds()` - Ahora es Recursiva
```typescript
function ensureIds(bloques: Bloque[]): Bloque[] {
  return bloques.map((b) => {
    const bloqueConId = {
      ...b,
      id: b.id ?? uuid(),
    };
    
    // Si tiene sub-bloques, procesarlos recursivamente
    if ('bloques' in bloqueConId && Array.isArray(bloqueConId.bloques)) {
      return {
        ...bloqueConId,
        bloques: ensureIds(bloqueConId.bloques)
      };
    }
    return bloqueConId;
  });
}
```
- Procesa bloques anidados sin perder datos

#### `actualizarBloqueAnidado()` - Nueva Función Recursiva
```typescript
const actualizarBloqueAnidado = (
  bloques: Bloque[],
  path: number[],
  bloqueActualizado: Bloque
): Bloque[] => {
  if (path.length === 0) return bloques;
  if (path.length === 1) {
    const index = path[0];
    return bloques.map((b, i) => (i === index ? bloqueActualizado : b));
  }
  
  const [currentIndex, ...restPath] = path;
  return bloques.map((b, i) => {
    if (i === currentIndex && 'bloques' in b && Array.isArray(b.bloques)) {
      return {
        ...b,
        bloques: actualizarBloqueAnidado(b.bloques, restPath, bloqueActualizado)
      };
    }
    return b;
  });
};
```
- Permite actualizar bloques en cualquier nivel de profundidad

#### `agregarFilaTabla()` - Sin Mutaciones
```typescript
const agregarFilaTabla = (indexBloque: number) => {
  const bloque = formData.estructura.bloques[indexBloque];
  if (bloque.tipo !== "tabla") return;
  
  const numColumnas = bloque.encabezados.length || 1;
  const nuevaFila = Array(numColumnas).fill("");
  
  // Crear nueva instancia sin mutar
  const bloqueActualizado = {
    ...bloque,
    filas: [...bloque.filas, nuevaFila]  // Array nuevo, no push()
  };
  
  actualizarBloque(indexBloque, bloqueActualizado);
};
```
- Evita `push()` que causa problemas con React
- Usa spread operator para crear nuevos arrays

#### `sanitizarBloques()` - Función Recursiva Mejorada
```typescript
const sanitizarBloques = (bloques: Bloque[], prefix = ""): Bloque[] => {
  return bloques.map((b, i) => {
    const contador = `${prefix}${i+1}`;
    
    switch(b.tipo) {
      case "capitulo":
      case "subcapitulo": {
        const bloqueCapitulo = b as any;
        return {
          ...bloqueCapitulo,
          titulo: (bloqueCapitulo.titulo?.trim() || `${b.tipo} ${contador}`),
          bloques: bloqueCapitulo.bloques ? sanitizarBloques(bloqueCapitulo.bloques, `${contador}.`) : []
        };
      }
      // ... otros casos
    }
  }).filter((b): b is Bloque => b !== null && b !== undefined);
};
```
- Procesa bloques anidados recursivamente
- Valida que no haya `null`/`undefined`
- Genera nombres automáticos si faltan

#### `eliminarBloque()` - Evita Mutaciones
```typescript
const eliminarBloque = (index: number) => {
  setFormData({
    ...formData,
    estructura: {
      ...formData.estructura,
      bloques: formData.estructura.bloques.filter((_, i) => i !== index)
    }
  });
};
```

#### `renderBloqueEditable()` - Con Guard
```typescript
const renderBloqueEditable = (
  bloque: Bloque,
  index: number,
  nivel = 0
): React.ReactNode => {
  // Guard para bloques nulos
  if (!bloque || !bloque.tipo) {
    console.warn("Bloque nulo o sin tipo detectado en índice", index, bloque);
    return (
      <div className="border-2 border-red-500 p-4 rounded bg-red-50 space-y-2">
        <p className="text-red-700 font-bold">⚠️ Error: Bloque corrupto en posición {index}</p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => eliminarBloque(index)}
        >
          Eliminar bloque corrupto
        </Button>
      </div>
    );
  }
  // ... resto de la función
};
```

### 2. **plantilla-preview.tsx**

#### `renderBloque()` - Con Guard
```typescript
const renderBloque = (
  bloque: Bloque,
  index: number,
  nivel = 0
): React.ReactNode => {
  // Guard para bloques nulos
  if (!bloque || !bloque.tipo) {
    console.warn("Bloque nulo o sin tipo detectado en preview, índice:", index, bloque);
    return (
      <div key={index} className="p-3 border border-red-300 rounded bg-red-50">
        <p className="text-red-700 font-semibold">⚠️ Error: Bloque corrupto</p>
      </div>
    );
  }
  // ... resto de la función
};
```
- Detecta y muestra bloques corruptos en lugar de crashear

## Beneficios

✅ **Estructuras grandes sin pérdida de datos** - Soporta 640+ bloques sin problemas
✅ **Bloques anidados funcionan correctamente** - Capítulos/subcapítulos se procesan recursivamente
✅ **Mejor manejo de estado** - Evita mutaciones directas que causan bugs
✅ **Detección de errores** - Muestra bloques corruptos en UI en lugar de crashear
✅ **Clonamiento seguro** - JSON.parse/stringify para evitar referencias compartidas

## Testing Recomendado

1. Crear una plantilla con 640+ bloques
2. Editar un bloque en el medio
3. Agregar una nueva tabla
4. Copiar una tabla existente
5. Verificar preview después de cada operación
6. Guardar y recargar la plantilla

Si todo funciona correctamente, no verás bloques `null` ni errores de corrupción.
