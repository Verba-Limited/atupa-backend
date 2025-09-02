import { Lesson } from '../models/Lesson';

const lessonsData: any[] = [
  {
    id: 'lesson-owe-001',
    categoryId: '4', // Proverbs category
    title: 'Introduction to Yoruba Proverbs',
    description: 'Learn the basics of Yoruba proverbs and their cultural significance',
    content: '<h2>Welcome to Yoruba Proverbs (Owe)</h2><p>Yoruba proverbs are the wisdom of our ancestors passed down through generations. They contain deep philosophical meanings and practical life lessons.</p><h3>What are Proverbs?</h3><p>Proverbs (Owe) are short, wise sayings that express a general truth or piece of advice. In Yoruba culture, they are used to:</p><ul><li>Teach moral lessons</li><li>Resolve conflicts</li><li>Share wisdom</li><li>Add depth to conversations</li></ul><h3>Example Proverb</h3><div class="proverb-example"><p><strong>Yoruba:</strong> "Bi a ba pe meji, meji a pe kan"</p><p><strong>English:</strong> "If we call two, two will call one"</p><p><strong>Meaning:</strong> Unity and cooperation are essential for success.</p></div><h3>Cultural Context</h3><p>Proverbs are often used by elders to guide younger generations. They reflect the values, beliefs, and experiences of the Yoruba people.</p>',
    level: 1,
    duration: 30,
    isPopular: true,
    isActive: true,
    prerequisites: [],
    mediaFiles: [
      {
        type: 'audio',
        url: '/assets/audio/owe-intro.mp3',
        description: 'Introduction to Yoruba proverbs pronunciation'
      }
    ]
  },
  {
    id: 'lesson-onka-001',
    categoryId: '1', // Numbers category
    title: 'Yoruba Numbers 1-10',
    description: 'Master the basic Yoruba numbers from one to ten',
    content: '<h2>Yoruba Numbers (Onka) - Basics</h2><p>Learning numbers is fundamental to speaking any language. Let\'s start with the basic Yoruba numbers from 1 to 10.</p><h3>Numbers 1-10</h3><div class="numbers-grid"><div class="number-item"><span class="number">1</span><span class="yoruba">Okan</span><span class="pronunciation">[oh-kahn]</span></div><div class="number-item"><span class="number">2</span><span class="yoruba">Meji</span><span class="pronunciation">[meh-jee]</span></div><div class="number-item"><span class="number">3</span><span class="yoruba">Meta</span><span class="pronunciation">[meh-tah]</span></div><div class="number-item"><span class="number">4</span><span class="yoruba">Merin</span><span class="pronunciation">[meh-reen]</span></div><div class="number-item"><span class="number">5</span><span class="yoruba">Marun</span><span class="pronunciation">[mah-roon]</span></div><div class="number-item"><span class="number">6</span><span class="yoruba">Mefa</span><span class="pronunciation">[meh-fah]</span></div><div class="number-item"><span class="number">7</span><span class="yoruba">Meje</span><span class="pronunciation">[meh-jeh]</span></div><div class="number-item"><span class="number">8</span><span class="yoruba">Mejo</span><span class="pronunciation">[meh-joh]</span></div><div class="number-item"><span class="number">9</span><span class="yoruba">Mesan</span><span class="pronunciation">[meh-sahn]</span></div><div class="number-item"><span class="number">10</span><span class="yoruba">Mewa</span><span class="pronunciation">[meh-wah]</span></div></div><h3>Practice Tips</h3><ul><li>Practice counting from 1-10 daily</li><li>Use numbers in everyday conversation</li><li>Listen to the audio pronunciation</li><li>Count objects around you in Yoruba</li></ul><h3>Memory Aid</h3><p>Remember that most Yoruba numbers start with "M" except "Okan" (1).</p>',
    level: 1,
    duration: 25,
    isPopular: true,
    isActive: true,
    prerequisites: [],
    mediaFiles: [
      {
        type: 'audio',
        url: '/assets/audio/numbers-1-10.mp3',
        description: 'Pronunciation of Yoruba numbers 1-10'
      }
    ]
  },
  {
    id: 'lesson-eranko-001',
    categoryId: '2', // Animals category
    title: 'Common Animals in Yoruba',
    description: 'Learn the names of common animals in Yoruba language',
    content: '<h2>Animals (Eranko) in Yoruba</h2><p>Animals play an important role in Yoruba culture, appearing in stories, proverbs, and everyday life. Let\'s learn some common animal names.</p><h3>Domestic Animals</h3><div class="animals-section"><div class="animal-item"><img src="/assets/images/dog.jpg" alt="Dog" /><h4>Aja</h4><p>Dog</p><span class="pronunciation">[ah-jah]</span></div><div class="animal-item"><img src="/assets/images/cat.jpg" alt="Cat" /><h4>Ologbo</h4><p>Cat</p><span class="pronunciation">[oh-log-boh]</span></div><div class="animal-item"><img src="/assets/images/cow.jpg" alt="Cow" /><h4>Maalu</h4><p>Cow</p><span class="pronunciation">[mah-ah-loo]</span></div><div class="animal-item"><img src="/assets/images/goat.jpg" alt="Goat" /><h4>Ewure</h4><p>Goat</p><span class="pronunciation">[eh-woo-reh]</span></div></div><h3>Wild Animals</h3><div class="animals-section"><div class="animal-item"><img src="/assets/images/lion.jpg" alt="Lion" /><h4>Kinniun</h4><p>Lion</p><span class="pronunciation">[keen-nee-oon]</span></div><div class="animal-item"><img src="/assets/images/elephant.jpg" alt="Elephant" /><h4>Erin</h4><p>Elephant</p><span class="pronunciation">[eh-reen]</span></div><div class="animal-item"><img src="/assets/images/tiger.jpg" alt="Tiger" /><h4>Ekun</h4><p>Tiger</p><span class="pronunciation">[eh-koon]</span></div></div><h3>Cultural Significance</h3><p>Many animals have special meanings in Yoruba culture:</p><ul><li><strong>Kinniun (Lion)</strong> - Symbol of strength and leadership</li><li><strong>Erin (Elephant)</strong> - Represents wisdom and memory</li><li><strong>Aja (Dog)</strong> - Loyalty and companionship</li></ul>',
    level: 1,
    duration: 35,
    isPopular: false,
    isActive: true,
    prerequisites: [],
    mediaFiles: [
      {
        type: 'audio',
        url: '/assets/audio/animals-pronunciation.mp3',
        description: 'Animal names pronunciation'
      }
    ]
  },
  {
    id: 'lesson-ilu-001',
    categoryId: '5', // Towns category  
    title: 'Major Yoruba Towns and Cities',
    description: 'Explore the important towns and cities in Yorubaland',
    content: '<h2>Important Yoruba Towns (Ilu)</h2><p>Yorubaland is rich with historic towns and cities, each with its unique culture and significance.</p><h3>Ancient Cities</h3><div class="cities-section"><div class="city-item"><h4>Ife</h4><p>Known as the cradle of Yoruba civilization. Home to the Ooni of Ife.</p><span class="significance">Cultural/Religious Center</span></div><div class="city-item"><h4>Oyo</h4><p>Former capital of the great Oyo Empire. Seat of the Alaafin.</p><span class="significance">Historical Capital</span></div><div class="city-item"><h4>Ijebu Ode</h4><p>Important trading center ruled by the Awujale.</p><span class="significance">Commercial Hub</span></div></div><h3>Modern Cities</h3><div class="cities-section"><div class="city-item"><h4>Lagos (Eko)</h4><p>Major commercial center and former capital of Nigeria.</p><span class="significance">Economic Center</span></div><div class="city-item"><h4>Ibadan</h4><p>One of the largest indigenous cities in Africa.</p><span class="significance">Educational Hub</span></div><div class="city-item"><h4>Abeokuta</h4><p>Capital of Ogun State, known as the city under the rock.</p><span class="significance">State Capital</span></div></div><h3>Traditional Rulers</h3><p>Each major Yoruba town has its traditional ruler:</p><ul><li><strong>Ife</strong> - Ooni of Ife</li><li><strong>Oyo</strong> - Alaafin of Oyo</li><li><strong>Lagos</strong> - Oba of Lagos</li><li><strong>Abeokuta</strong> - Alake of Egbaland</li><li><strong>Ijebu Ode</strong> - Awujale of Ijebuland</li></ul>',
    level: 1,
    duration: 40,
    isPopular: true,
    isActive: true,
    prerequisites: [],
    mediaFiles: []
  },
  {
    id: 'lesson-alufabeti-001',
    categoryId: 'alphabet',
    title: 'Yoruba Alphabet and Pronunciation',
    description: 'Master the Yoruba alphabet and proper pronunciation',
    content: '<h2>Yoruba Alphabet (Alufabeti)</h2><p>The Yoruba alphabet consists of 25 letters, including tone marks that are crucial for proper pronunciation and meaning.</p><h3>Basic Letters</h3><div class="alphabet-grid"><span>A a</span><span>B b</span><span>D d</span><span>E e</span><span>Ẹ ẹ</span><span>F f</span><span>G g</span><span>Gb gb</span><span>H h</span><span>I i</span><span>J j</span><span>K k</span><span>L l</span><span>M m</span><span>N n</span><span>O o</span><span>Ọ ọ</span><span>P p</span><span>R r</span><span>S s</span><span>Ṣ ṣ</span><span>T t</span><span>U u</span><span>W w</span><span>Y y</span></div><h3>Tone Marks</h3><p>Yoruba is a tonal language with three tones:</p><ul><li><strong>High tone (´)</strong> - Rising pitch: á, é, í, ó, ú</li><li><strong>Mid tone (no mark)</strong> - Normal pitch: a, e, i, o, u</li><li><strong>Low tone (`)</strong> - Falling pitch: à, è, ì, ò, ù</li></ul><h3>Special Characters</h3><div class="special-chars"><div class="char-item"><span class="char">Ẹ ẹ</span><span class="sound">Open \'e\' sound like in \'bet\'</span></div><div class="char-item"><span class="char">Ọ ọ</span><span class="sound">Open \'o\' sound like in \'thought\'</span></div><div class="char-item"><span class="char">Ṣ ṣ</span><span class="sound">\'sh\' sound like in \'shoe\'</span></div><div class="char-item"><span class="char">Gb gb</span><span class="sound">Combined \'g\' and \'b\' sound</span></div></div><h3>Practice Words</h3><div class="practice-words"><div class="word-item"><span class="yoruba">bàbá</span><span class="meaning">father</span><span class="pronunciation">[bah-bah]</span></div><div class="word-item"><span class="yoruba">màmá</span><span class="meaning">mother</span><span class="pronunciation">[mah-mah]</span></div><div class="word-item"><span class="yoruba">ẹja</span><span class="meaning">fish</span><span class="pronunciation">[eh-jah]</span></div></div>',
    level: 1,
    duration: 45,
    isPopular: true,
    isActive: true,
    prerequisites: [],
    mediaFiles: [
      {
        type: 'audio',
        url: '/assets/audio/alphabet-pronunciation.mp3',
        description: 'Complete Yoruba alphabet pronunciation'
      }
    ]
  }
];

export class LessonSeeder {
  static async seedLessons(): Promise<void> {
    try {
      console.log('Seeding lessons...');
      
      for (const lessonData of lessonsData) {
        await Lesson.findOneAndUpdate(
          { id: lessonData.id },
          lessonData,
          { upsert: true, new: true }
        );
      }
      
      console.log(`${lessonsData.length} lessons seeded successfully`);
    } catch (error) {
      console.error('Error seeding lessons:', error);
      throw error;
    }
  }
}
