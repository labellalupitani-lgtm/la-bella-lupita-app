// Carta real de La Bella Lupita, extraída de labellalupita.com (agosto 2026).
// Precios en centavos de córdoba: C$ 280.00 => 28000.

export type Momento = 'barra' | 'brunch' | 'bistro' | 'sobremesa'

export type PlatoCarta = {
  informacion?: { porcion: string; componentes: string; fotoVerificada: boolean; revisado: string }
  id: string
  nombre: string
  descripcion: string
  /** centavos de córdoba */
  precio: number
  categoria: string
  momento: Momento
  foto: string | null
  popular: boolean
  etiquetas: string[]
  /** perfil de taza, en mayúsculas y con puntos medios, al estilo de la marca */
  perfil?: string
  /** nombre corto de la variante, cuando el plato se presenta como familia */
  fruta?: string
  /** a qué sabe esa variante, en pocas palabras */
  nota?: string
}

export const MOMENTOS: { id: Momento; titulo: string; desc: string; minutos: number; nota: string }[] = [
  {
    id: 'barra',
    titulo: 'Barra',
    desc: 'Espresso, cortado y filtrado del lote del mes. De pie o para llevar, en minutos.',
    minutos: 6,
    nota: 'El espresso no se apura.',
  },
  {
    id: 'brunch',
    titulo: 'Brunch',
    desc: 'Huevos, pan de casa y fruta de estación. Mesa lenta para empezar el día sin reloj.',
    minutos: 15,
    nota: 'Los huevos se hacen al momento.',
  },
  {
    id: 'bistro',
    titulo: 'Bistró',
    desc: 'Cocina de sartén y horno: pastas, sándwiches y el plato del día con sazón de casa.',
    minutos: 22,
    nota: 'Sartén, horno y punto.',
  },
  {
    id: 'sobremesa',
    titulo: 'Sobremesa',
    desc: 'Repostería recién salida y café de la tarde, para la conversación que no quiere terminar.',
    minutos: 5,
    nota: 'Ya está en la vitrina.',
  },
]

export const CARTA: PlatoCarta[] = [
  { id: "espresso", nombre: "Espresso", descripcion: "Treinta mililitros del Aguacatal, la ladera de la familia. Veintiséis segundos, crema espesa, panela.", precio: 8000, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "CORTO · DENSO · FINAL PERSISTENTE" },
  { id: "cortadito", nombre: "Cortadito", descripcion: "Un espresso cortado con leche caliente en partes iguales. Baja el filo, no el café.", precio: 9000, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "PARTES IGUALES · TEMPLADO · DULCE" },
  { id: "macchiato", nombre: "Macchiato", descripcion: "Mismo espresso, apenas manchado: una cucharada de espuma encima. Se toma en dos sorbos.", precio: 9000, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "FUERTE · MANCHADO · ESPUMA ENCIMA" },
  { id: "americano", nombre: "Americano", descripcion: "Espresso alargado con agua caliente. Al abrirse la taza aparece la naranja madura de la finca.", precio: 8500, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "LARGO · CLARO · ACIDEZ DE NARANJA" },
  { id: "latte", nombre: "Latte", descripcion: "Leche texturizada al vapor sobre un espresso de Matagalpa. Más leche que café, textura de seda.", precio: 9500, categoria: "bebidas-calientes", momento: "barra", foto: "/images/latte-logo-mesa-960.webp", popular: false, etiquetas: [], perfil: "SEDOSO · LECHOSO · CAFÉ DE FONDO" },
  { id: "cappuccino", nombre: "Cappuccino", descripcion: "Tercios parejos: espresso, leche y espuma. Más aire que el latte, más café por sorbo.", precio: 9500, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "AIREADO · TERCIOS PAREJOS · CAFÉ FRANCO" },
  { id: "mocha", nombre: "Mocha", descripcion: "Espresso, chocolate fundido y leche al vapor. El fondo de cacao del grano, subido de tono.", precio: 12000, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "CACAO · DULCE · CUERPO REDONDO" },
  { id: "te-caliente", nombre: "Té Caliente", descripcion: "La opción sin café de la barra. Hoja en infusión, agua a punto y no hirviendo.", precio: 10000, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "HOJA EN INFUSIÓN · FINAL LIMPIO" },
  { id: "iced-americano", nombre: "Iced Americano", descripcion: "Espresso caído directo sobre hielo y agua. El grano se abre en frío, más cítrico.", precio: 14000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "iced-latte", nombre: "Iced Latte", descripcion: "Leche fría sobre hielo y el espresso encima, sin mezclar. Se revuelve antes del primer sorbo.", precio: 16000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "cremoso-cafe", nombre: "Cremoso de Café", descripcion: "Café, leche y hielo licuados hasta quedar espeso. Se toma con pajilla ancha, no con cuchara.", precio: 20000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "cremoso-oreo", nombre: "Cremoso de Oreo", descripcion: "El mismo licuado con galleta molida adentro y encima. Textura con grumos, a propósito.", precio: 21000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "cremoso-light", nombre: "Cremoso Light", descripcion: "Sin azúcar añadida. Solo el dulce que trae la leche y el que deja el tueste.", precio: 21000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "limonada-bella-lupita", nombre: "Limonada Bella Lupita", descripcion: "La clásica lleva limón y hielo. Esta lleva tres frutas, hierbabuena machacada al momento y vaso doble.", precio: 19000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "De la casa", nota: "Tres frutas, hierbabuena y vaso doble." },
  { id: "limonada-clasica", nombre: "Limonada Clásica", descripcion: "Limón, hielo y azúcar justa.", precio: 13000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Clásica", nota: "Limón, hielo y azúcar justa." },
  { id: "limonada-hierbabuena", nombre: "Limonada Hierbabuena", descripcion: "Hoja machacada, verde y con filo.", precio: 14000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Hierbabuena", nota: "Hoja machacada, verde y con filo." },
  { id: "limonada-mango", nombre: "Limonada Mango", descripcion: "Pulpa de mango maduro, densa y amarilla.", precio: 17000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Mango", nota: "Pulpa de mango maduro, densa y amarilla." },
  { id: "limonada-pitahaya", nombre: "Limonada Pitahaya", descripcion: "Color fucsia, sabor suave, semillas que crujen.", precio: 15000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Pitahaya", nota: "Color fucsia, sabor suave, semillas que crujen." },
  { id: "limonada-fresa", nombre: "Limonada Fresa", descripcion: "Fresa madura, dulce contra el ácido del limón.", precio: 17000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Fresa", nota: "Fresa madura, dulce contra el ácido del limón." },
  { id: "limonada-sandia-menta", nombre: "Limonada Sandía Menta", descripcion: "Sandía jugosa, menta que enfría al final.", precio: 17000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Sandía y menta", nota: "Sandía jugosa, menta que enfría al final." },
  { id: "limonada-maracuya", nombre: "Limonada de Calala", descripcion: "Calala colada, ácida y perfumada.", precio: 17000, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Maracuyá", nota: "Calala colada, ácida y perfumada." },
  { id: "gaseosa", nombre: "Gaseosa", descripcion: "Bien fría, para el que no toma café.", precio: 6000, categoria: "gaseosas", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "agua", nombre: "Agua", descripcion: "Agua pura, fría o al tiempo. Decinos cómo la querés.", precio: 6000, categoria: "gaseosas", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "soda", nombre: "Soda", descripcion: "Agua con gas y hielo. Limpia el paladar entre bocados.", precio: 6000, categoria: "gaseosas", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "arancini", nombre: "Arancini", descripcion: "Croquetas de risotto inspiradas en el gallo pinto, doradas al momento y servidas con salsa Nikkei.", precio: 22000, categoria: "entradas", momento: "bistro", foto: "/menu/arancini-01-960.webp", popular: false, etiquetas: ["croquetas", "gallo pinto", "Nikkei"] },
  { id: "bocado-queso-platano", nombre: "Bocado de Queso & Plátano", descripcion: "Crujientes tajadas de plátano verde con queso artesanal dorado y un toque de chile criollo.", precio: 34000, categoria: "entradas", momento: "bistro", foto: null, popular: false, etiquetas: ["plátano", "queso", "chile"] },
  { id: "chilotes-milpa", nombre: "Chilotes de la Milpa", descripcion: "Chilotes asados al carbón, marinados en especias y servidos con alioli de chipotle ahumado.", precio: 32000, categoria: "entradas", momento: "bistro", foto: "/menu/chilotes-de-la-milpa-01-960.webp", popular: false, etiquetas: ["chilote", "chipotle", "carbón"] },
  { id: "carpaccio-camaron", nombre: "Carpaccio de Camarón", descripcion: "Láminas de camarón en leche de tigre de calaltá, cebolla encurtida, cilantro y tajadas de plátano verde.", precio: 58000, categoria: "entradas", momento: "bistro", foto: "/menu/carpaccio-de-camaron-01-960.webp", popular: false, etiquetas: ["camarón", "leche de tigre", "plátano"] },
  { id: "carpaccio-pesca", nombre: "Carpaccio de la Pesca del Día", descripcion: "Pesca del día curada en cítricos, salsa Nikkei, hierbas frescas y un sutil toque ahumado.", precio: 40000, categoria: "entradas", momento: "bistro", foto: "/menu/carpaccio-de-la-pesca-del-dia-01-960.webp", popular: false, etiquetas: ["pesca", "cítricos", "Nikkei"] },
  { id: "spring-roll", nombre: "Spring Roll", descripcion: "Rollos rellenos de vegetales frescos, fritos al momento y servidos con salsa oriental.", precio: 25000, categoria: "entradas", momento: "bistro", foto: "/menu/spring-roll-01-960.webp", popular: false, etiquetas: ["vegetales", "salsa oriental"] },
  { id: "baba-ganoush", nombre: "Baba Ganoush", descripcion: "Crema de berenjena tatemada con pan artesanal, aceitunas, alcaparras, tomates cherry y morrones.", precio: 46000, categoria: "entradas", momento: "bistro", foto: "/menu/baba-ganoush-01-960.webp", popular: true, etiquetas: ["berenjena", "pan", "aceitunas"] },
  { id: "bowl-terruño", nombre: "Bowl del Terruño", descripcion: "Pollo soasado con arroz, frijoles, tajadas verdes, maduro, queso frito, aguacate y pico de gallo.", precio: 65000, categoria: "bowls", momento: "bistro", foto: "/menu/bowl-del-terruno-01-960.webp", popular: false, etiquetas: ["pollo", "arroz", "aguacate"] },
  { id: "bowl-lupita", nombre: "Bowl Lupita", descripcion: "Gallo pinto con carne sazonada, queso frito, maduro, tajadas verdes, guacamole y pico de gallo.", precio: 70000, categoria: "bowls", momento: "bistro", foto: "/menu/bowl-lupita-01-960.webp", popular: true, etiquetas: ["gallo pinto", "carne", "guacamole"] },
  { id: "pizza-churrasco", nombre: "Pizza Churrasco", descripcion: "Churrasco a la parrilla, mozzarella artesanal y chimichurri de la casa.", precio: 67000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-churrasco-01-960.webp", popular: true, etiquetas: ["churrasco", "mozzarella", "chimichurri"] },
  { id: "pizza-margherita", nombre: "Pizza Margherita", descripcion: "Salsa pomodoro, mozzarella fresca, tomate y albahaca sobre masa madre.", precio: 45000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-margarita-01-960.webp", popular: false, etiquetas: ["tomate", "mozzarella", "albahaca"] },
  { id: "pizza-cuatro-estaciones", nombre: "Pizza Cuatro Estaciones", descripcion: "Una combinación de ingredientes frescos que reúne cuatro sabores en una sola pizza.", precio: 55000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-4-estacion-01-960.webp", popular: false, etiquetas: ["cuatro estaciones", "mozzarella"] },
  { id: "pizza-jamon", nombre: "Pizza de Jamón", descripcion: "Jamón premium, mozzarella artesanal y salsa pomodoro.", precio: 45000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-jamon-tradicional-01-960.webp", popular: false, etiquetas: ["jamón", "mozzarella", "pomodoro"] },
  { id: "pizza-pepperoni", nombre: "Pizza de Pepperoni", descripcion: "Mozzarella artesanal y abundante pepperoni sobre salsa pomodoro.", precio: 45000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-peperoni-01-960.webp", popular: false, etiquetas: ["pepperoni", "mozzarella", "pomodoro"] },
  { id: "pizza-caprichosa", nombre: "Pizza Caprichosa", descripcion: "Trozos de pollo jugoso, pepperoni, aceitunas y mozzarella artesanal.", precio: 60000, categoria: "pizzas", momento: "bistro", foto: null, popular: false, etiquetas: ["pollo", "pepperoni", "aceitunas"] },
  { id: "pizza-arrabiata", nombre: "Pizza Arrabiata", descripcion: "Lomo ahumado, mozzarella, salsa pomodoro y un toque de chile.", precio: 55000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-arrabiata-01-960.webp", popular: false, etiquetas: ["lomo", "chile", "mozzarella"] },
  { id: "pizza-camaron", nombre: "Pizza de Camarón Especial", descripcion: "Camarones salteados, mozzarella artesanal y vegetales frescos.", precio: 68000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-camaron-01-960.webp", popular: false, etiquetas: ["camarón", "mozzarella", "vegetales"] },
  { id: "pizza-salami", nombre: "Pizza de Salami", descripcion: "Salami premium, mozzarella artesanal y salsa pomodoro.", precio: 60000, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-salami-01-960.webp", popular: false, etiquetas: ["salami", "mozzarella", "pomodoro"] },
  { id: "ensalada-lupita", nombre: "Ensalada Lupita", descripcion: "Mix de lechugas, vegetales frescos, pasta penne, parmesano y aderezo de la casa. Disponible con camarón, pollo o res.", precio: 64000, categoria: "ensaladas", momento: "bistro", foto: "/menu/ensalada-lupita-01-960.webp", popular: false, etiquetas: ["lechuga", "penne", "parmesano"] },
  { id: "ensalada-thai", nombre: "Ensalada Thai", descripcion: "Lechugas mixtas, repollo morado, pollo asado, ajonjolí, aceitunas y vinagreta oriental.", precio: 47000, categoria: "ensaladas", momento: "bistro", foto: "/menu/ensalada-tais-01-960.webp", popular: false, etiquetas: ["pollo", "ajonjolí", "oriental"] },
  { id: "ensalada-caesar", nombre: "Ensalada Caesar", descripcion: "Lechuga romana, pollo crujiente, parmesano, crutones artesanales y aderezo Caesar de la casa.", precio: 45000, categoria: "ensaladas", momento: "bistro", foto: "/menu/ensalada-cesar-01-960.webp", popular: false, etiquetas: ["pollo", "parmesano", "crutones"] },
  { id: "hamburguesa-autor", nombre: "Hamburguesa de Autor", descripcion: "Carne preparada en casa, mezcla de quesos, lechuga romana, tomate y pan brioche, servida con papas artesanales.", precio: 48000, categoria: "platos-fuertes", momento: "bistro", foto: null, popular: true, etiquetas: ["carne", "queso", "papas"] },
  { id: "churrasco-mi-tierra", nombre: "Churrasco de Mi Tierra", descripcion: "Corte de res a la parrilla con chimichurri ahumado, gallo pinto, tostones y ensalada primavera.", precio: 80000, categoria: "platos-fuertes", momento: "bistro", foto: null, popular: true, etiquetas: ["res", "chimichurri", "gallo pinto"] },
  { id: "costillas-bbq", nombre: "Costillas BBQ de la Casa", descripcion: "Costillas de cerdo glaseadas en salsa BBQ artesanal, acompañadas de platanitos crujientes y pepino fresco.", precio: 54000, categoria: "platos-fuertes", momento: "bistro", foto: null, popular: false, etiquetas: ["cerdo", "BBQ", "plátano"] },
  { id: "salmon-chef", nombre: "Salmón del Chef La Bella Lupita", descripcion: "Filete de salmón con puré mixto, zucchini asado y salsa de café de especialidad La Bella Lupita.", precio: 83000, categoria: "platos-fuertes", momento: "bistro", foto: "/menu/salmon-del-chef-la-bella-lupita-01-960.webp", popular: true, etiquetas: ["salmón", "zucchini", "café"] },
  { id: "panini-churrasco", nombre: "Panini Churrasco", descripcion: "Pan artesanal relleno de churrasco, jamón ahumado, queso fundido, tomate, lechuga y chimichurri.", precio: 53000, categoria: "paninis", momento: "bistro", foto: "/menu/panini-churrasco-01-960.webp", popular: false, etiquetas: ["churrasco", "jamón", "queso"] },
  { id: "panini-pesto", nombre: "Panini Pesto", descripcion: "Pollo a la plancha, pesto casero, tomate, lechuga y queso fundido en pan artesanal.", precio: 40000, categoria: "paninis", momento: "bistro", foto: "/menu/panini-pesto-01-960.webp", popular: false, etiquetas: ["pollo", "pesto", "queso"] },
  { id: "risotto-gallo-pinto", nombre: "Risotto de Gallo Pinto", descripcion: "Tradicional gallo pinto transformado en un cremoso risotto, servido con huevo al gusto, aguacate y tortilla crujiente.", precio: 28000, categoria: "desayunos", momento: "brunch", foto: "/menu/risoto-gallopinto-01-960.webp", popular: true, etiquetas: ["gallo pinto", "huevo", "aguacate"] },
  { id: "para-empezar-el-dia", nombre: "Para Empezar el Día", descripcion: "Pan brioche con huevo cremoso, lechuga fresca y papines salteados en mantequilla y hierbas.", precio: 34000, categoria: "desayunos", momento: "brunch", foto: "/menu/para-empezar-el-dia-01-960.webp", popular: false, etiquetas: ["brioche", "huevo", "papines"] },
  { id: "dulce-tentacion", nombre: "Dulce Tentación", descripcion: "Waffle artesanal con mermelada de fresa casera, chantilly, frutas de temporada, tierra de chocolate y miel de maple.", precio: 32000, categoria: "desayunos", momento: "brunch", foto: "/menu/waffle-dulce-tentacion-01-960.webp", popular: true, etiquetas: ["waffle", "fresa", "frutas"] },
  { id: "la-bella-lupita", nombre: "La Bella Lupita", descripcion: "Frijoles cremosos sobre queso fundido, acompañados de huevo al gusto, aguacate, queso artesanal y tajadas verdes.", precio: 35000, categoria: "desayunos", momento: "brunch", foto: "/menu/la-bella-lupita-01-960.webp", popular: false, etiquetas: ["frijoles", "huevo", "aguacate"] },
  { id: "nica-toast", nombre: "Nica Toast", descripcion: "Pan brioche caramelizado con compota de frutos rojos y miel.", precio: 30000, categoria: "desayunos", momento: "brunch", foto: "/menu/nica-toast-01-960.webp", popular: false, etiquetas: ["brioche", "frutos rojos", "miel"] },
  { id: "smoothie-bowl", nombre: "Smoothie Bowl & Frutos de Temporada", descripcion: "Frutas congeladas, jugo de naranja, granola artesanal, frutas frescas y miel.", precio: 27000, categoria: "desayunos", momento: "brunch", foto: "/menu/smoothie-bowl-01-960.webp", popular: false, etiquetas: ["frutas", "granola", "miel"] },
  { id: "bagel-el-consentido", nombre: "Bagel el Consentido", descripcion: "Bagel con crema de la casa, jamón, huevos de codorniz, germinados y reducción balsámica.", precio: 40000, categoria: "desayunos", momento: "brunch", foto: "/menu/bagel-el-consentido-01-960.webp", popular: false, etiquetas: ["bagel", "jamón", "huevo"] },
  { id: "budin-chia", nombre: "Budín de Chía", descripcion: "Chía en leche de almendra con frutas frescas y un sutil toque de naranja ahumada.", precio: 23000, categoria: "desayunos", momento: "brunch", foto: "/menu/budin-chia-y-fruto-de-temporada-01-960.webp", popular: false, etiquetas: ["chía", "almendra", "frutas"] },
  { id: "pancake-huerta", nombre: "Pancake de la Huerta", descripcion: "Pancakes esponjosos con yogur griego, frutas de temporada y syrup artesanal.", precio: 34000, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["pancakes", "yogur", "frutas"] },
  { id: "huevos-poche", nombre: "Huevos Poché del Chef", descripcion: "Pan brioche con queso crema, hongos salteados, huevo poché y reducción balsámica.", precio: 38000, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["brioche", "hongos", "huevo"] },
  { id: "omelette-campesino", nombre: "Omelette Campesino", descripcion: "Omelette de vegetales y queso fundido, servido con ensalada de la huerta y pan artesanal.", precio: 38000, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["huevo", "vegetales", "queso"] },
  { id: "mollete-huerto", nombre: "Mollete del Huerto", descripcion: "Pan brioche con huevo, crema de aguacate, parmesano, brotes y flores comestibles.", precio: 38000, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["brioche", "aguacate", "parmesano"] },
  { id: "waffle-bistro", nombre: "Waffle del Bistró", descripcion: "Waffle artesanal con jamón curado, salsa pomodoro, queso fundido y reducción balsámica.", precio: 38000, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["waffle", "jamón", "queso"] },
  { id: "bagel-salmon", nombre: "Bagel de Salmón", descripcion: "Bagel con salmón curado, crema de queso y chips de camote.", precio: 43000, categoria: "desayunos", momento: "brunch", foto: "/menu/bagel-de-salmon-01-960.webp", popular: true, etiquetas: ["bagel", "salmón", "camote"] },
  { id: "delicias-abuela", nombre: "Delicias de la Abuela", descripcion: "Postre de mango ahumado con el sello dulce de la casa.", precio: 25000, categoria: "postres", momento: "sobremesa", foto: "/menu/delicia-de-la-abuela-de-mango-ahumado-01-960.webp", popular: false, etiquetas: ["mango", "ahumado"] },
  { id: "torrijas-autor", nombre: "Torrijas de Autor", descripcion: "Torrijas artesanales de la casa, doradas y servidas con una composición de temporada.", precio: 30000, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["torrijas", "artesanal"] },
  { id: "cheesecake-cafe", nombre: "Cheesecake de Café", descripcion: "Cheesecake cremoso con café de especialidad de la casa.", precio: 24000, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["cheesecake", "café"] },
  { id: "cheesecake-pistacho", nombre: "Cheesecake de Pistacho", descripcion: "Cheesecake cremoso con el sabor delicado del pistacho.", precio: 27000, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["cheesecake", "pistacho"] },
  { id: "pastel-chocolate", nombre: "Pastel de Chocolate", descripcion: "Pastel de chocolate de la casa, intenso y reconfortante.", precio: 22000, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["pastel", "chocolate"] },
  { id: "tres-leches", nombre: "Tres Leches", descripcion: "Clásico pastel tres leches de textura suave y cremosa.", precio: 22000, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["pastel", "leche"] },
  { id: "natilla", nombre: "Natilla", descripcion: "Natilla tradicional de la casa, suave y delicada.", precio: 20000, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["natilla", "tradicional"] },
  { id: "flan-caramelo", nombre: "Flan de Caramelo", descripcion: "Flan sedoso con caramelo artesanal.", precio: 22000, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["flan", "caramelo"] },
]

/** Los ocho cafés de la barra, en el orden en que se leen en la matriz:
 *  primero los que van solos, después los que llevan leche al vapor. */
export const CAFES_SOLOS = ['espresso', 'americano', 'te-caliente'] as const
export const CAFES_CON_LECHE = ['cortadito', 'macchiato', 'latte', 'cappuccino', 'mocha'] as const

/** Las limonadas se presentan como una sola pieza con selector de fruta, pero
 *  cada una conserva su id para el carrito. */
export const esLimonada = (p: PlatoCarta) => p.id.startsWith('limonada-')
export const esCafeBarra = (p: PlatoCarta) => p.categoria === 'bebidas-calientes'
export const esAcompanar = (p: PlatoCarta) => p.categoria === 'gaseosas'
export const esFriaDeCafe = (p: PlatoCarta) => p.categoria === 'bebidas-frias' && !esLimonada(p)

export const porMomento = (m: Momento) => CARTA.filter((p) => p.momento === m)
export const buscarPlato = (id: string) => CARTA.find((p) => p.id === id)
export const destacados = () => CARTA.filter((p) => p.popular)

/** Momento sugerido según la hora local de Managua. */
export function momentoDeLaHora(h: number): Momento {
  if (h < 11) return 'brunch'
  if (h < 15) return 'bistro'
  if (h < 18) return 'sobremesa'
  return 'barra'
}
