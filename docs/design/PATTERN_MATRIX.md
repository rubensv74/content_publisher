# Matriz de patrones visuales

Derivada del catálogo inicial de referencias. Los patrones son abstracciones: describen soluciones generales de composición y narrativa, no copias de diseños externos.

## Patrones de portada

| Código | Patrón | Mejor para | Riesgo |
|---|---|---|---|
| P-COV-01 | Titular dominante + microfirma | reflexión, aprendizaje, concepto | parecer demasiado vacío si el texto no es fuerte |
| P-COV-02 | Métrica dominante + explicación breve | datos, rendimiento, resultados | convertir la pieza en una tarjeta KPI genérica |
| P-COV-03 | Screenshot protagonista + titular corto | producto, UI, prototipo | reducir demasiado la captura |
| P-COV-04 | Split 50/50 contenido + imagen | build, caso de estudio | volverse corporativo y rígido |
| P-COV-05 | Diagrama simple + pregunta | arquitectura, sistemas | diagramas demasiado pequeños en móvil |
| P-COV-06 | Before / After inmediato | rediseño, mejora, evolución | necesitar dos imágenes comparables |

## Patrones de contenido

| Código | Patrón | Mejor para | Riesgo |
|---|---|---|---|
| P-BDY-01 | Una idea por página | tutorial, aprendizaje | alargar contenido innecesariamente |
| P-BDY-02 | Número + significado | data story | abusar de métricas sin contexto |
| P-BDY-03 | Problema → decisión → resultado | build, arquitectura | simplificar demasiado decisiones complejas |
| P-BDY-04 | Screenshot anotado | UI, Power Platform, Power BI | exceso de marcadores |
| P-BDY-05 | Paso numerado | proceso, tutorial | parecer manual genérico |
| P-BDY-06 | Código + traducción humana | SQL, Power Fx, TypeScript | código ilegible por densidad |
| P-BDY-07 | Arquitectura por capas | integración, sistemas | diagrama técnico excesivo |
| P-BDY-08 | Dos alternativas enfrentadas | decisiones, comparación | crear falsa dicotomía |
| P-BDY-09 | Insight + evidencia | reflexión técnica | afirmar sin respaldo |
| P-BDY-10 | Micro-dashboard editorial | datos, BI | intentar meter un dashboard real completo |

## Patrones de cierre

| Código | Patrón | Mejor para | Riesgo |
|---|---|---|---|
| P-END-01 | Lección principal | casi cualquier serie | cierre demasiado obvio |
| P-END-02 | Checklist resumida | tutorial | repetir páginas anteriores |
| P-END-03 | Pregunta útil | conversación | CTA artificial |
| P-END-04 | Resultado final / screenshot | build, case study | cerrar sin aprendizaje |
| P-END-05 | Próxima entrega / serie | publicaciones recurrentes | prometer contenido no preparado |

## Patrones de identidad

| Código | Patrón | Descripción |
|---|---|---|
| P-ID-01 | Microfirma fija | nombre o símbolo pequeño en posición estable |
| P-ID-02 | Serie + número | BUILD / 014, DATA / 006, etc. |
| P-ID-03 | Paleta base + acento temático | identidad consistente con variación por tema |
| P-ID-04 | Tipografía constante | jerarquías estables aunque cambie el layout |
| P-ID-05 | Recurso geométrico mínimo | línea, esquina, barra o marcador recurrente |
| P-ID-06 | Etiqueta de dominio | POWER PLATFORM, DATA, ANDROID, ARCHITECTURE… |

## Patrones que queremos evitar

| Código | Anti-patrón | Motivo |
|---|---|---|
| A-01 | Logo grande permanente | convierte la publicación en anuncio |
| A-02 | Footer enorme | roba espacio al contenido y recuerda a plantillas comerciales |
| A-03 | Neón + robot + circuitos por defecto | cliché visual de IA/tech |
| A-04 | Mockup de dispositivo como norma | reduce innecesariamente el área útil de screenshots |
| A-05 | Cinco ideas en una sola página | mala lectura móvil |
| A-06 | Captura de código sin tratamiento | ilegible y poco didáctica |
| A-07 | Decoración sin función | aumenta ruido y complica el renderizado |
| A-08 | CTA comercial en todas las piezas | deteriora credibilidad y tono profesional |

## Regla de composición

Un arquetipo de Content Publisher debería combinar normalmente:

**1 patrón de portada o cuerpo + 1–2 patrones de identidad + una regla narrativa clara.**

La variedad debe provenir de combinaciones controladas, no de añadir decoración arbitraria.
