import { Quiz } from '../models/Quiz';
import { Category } from '../models/Category';

// Import quiz data from frontend (converted to backend format)
const numberQuestions = [
  {
    id: '101',
    categoryId: '1',
    categoryName: 'onka',
    levelNumber: 1,
    questionNumber: 1,
    question: 'Kini 1 ni Yoruba?',
    options: {
      option1: 'Mefa',
      option2: 'Okan',
      option3: 'Marun',
      option4: 'Meji',
    },
    answer: 'option2',
    explanation: "1 in Yoruba is 'Okan'.",
    picture: null,
    points: 10,
    difficulty: 'easy' as const
  },
  {
    id: '102',
    categoryId: '1',
    categoryName: 'onka',
    levelNumber: 1,
    questionNumber: 2,
    question: 'Kini 5 ni Yoruba?',
    options: {
      option1: 'Marun',
      option2: 'Mefa',
      option3: 'Meje',
      option4: 'Merin',
    },
    answer: 'option1',
    explanation: "5 in Yoruba is 'Marun'.",
    picture: null,
    points: 10,
    difficulty: 'easy' as const
  },
  {
    id: '103',
    categoryId: '1',
    categoryName: 'onka',
    levelNumber: 1,
    questionNumber: 3,
    question: 'Kini 10 ni Yoruba?',
    options: {
      option1: 'Mewa',
      option2: 'Mejo',
      option3: 'Meje',
      option4: 'Mefa',
    },
    answer: 'option1',
    explanation: "10 in Yoruba is 'Mewa'.",
    picture: null,
    points: 10,
    difficulty: 'easy' as const
  }
  // Add more questions here...
];

const animalQuestions = [
  {
    id: '201',
    categoryId: '2',
    categoryName: 'eranko',
    levelNumber: 1,
    questionNumber: 1,
    question: 'Kini Tiger ni Yoruba?',
    options: {
      option1: 'Ekun',
      option2: 'Amotekun',
      option3: 'Kinniun',
      option4: 'Eja',
    },
    answer: 'option1',
    explanation: "Tiger in Yoruba is 'Ekun'.",
    picture: 'https://images.pexels.com/photos/3275319/pexels-photo-3275319.jpeg',
    points: 10,
    difficulty: 'easy' as const
  },
  {
    id: '202',
    categoryId: '2',
    categoryName: 'eranko',
    levelNumber: 1,
    questionNumber: 2,
    question: 'Kini Lion ni Yoruba?',
    options: {
      option1: 'Ekun',
      option2: 'Amotekun',
      option3: 'Kinniun',
      option4: 'Eja',
    },
    answer: 'option3',
    explanation: "Lion in Yoruba is 'Kinniun'.",
    picture: 'https://images.pexels.com/photos/1598377/pexels-photo-1598377.jpeg',
    points: 10,
    difficulty: 'easy' as const
  }
  // Add more animal questions...
];

const categories = [
  {
    id: '1',
    name: 'onka',
    displayName: 'Numbers (Onka)',
    description: 'Learn Yoruba numbers from 1 to 1000 and beyond',
    icon: 'numbers-outline',
    totalLevels: 3,
    isActive: true,
    order: 1
  },
  {
    id: '2',
    name: 'eranko',
    displayName: 'Animals (Eranko)',
    description: 'Learn names of animals in Yoruba language',
    icon: 'paw-outline',
    totalLevels: 2,
    isActive: true,
    order: 2
  },
  {
    id: '3',
    name: 'oba-ilu',
    displayName: 'Kings (Oba Ilu)',
    description: 'Learn about Yoruba traditional rulers and their kingdoms',
    icon: 'crown-outline',
    totalLevels: 2,
    isActive: true,
    order: 3
  },
  {
    id: '4',
    name: 'owe',
    displayName: 'Proverbs (Owe)',
    description: 'Master Yoruba proverbs and their meanings',
    icon: 'book-outline',
    totalLevels: 3,
    isActive: true,
    order: 4
  },
  {
    id: '5',
    name: 'ilu',
    displayName: 'Towns (Ilu)',
    description: 'Learn about Yoruba towns and cities',
    icon: 'location-outline',
    totalLevels: 2,
    isActive: true,
    order: 5
  },
  {
    id: '6',
    name: 'eso',
    displayName: 'Fruits (Eso)',
    description: 'Learn names of fruits in Yoruba language',
    icon: 'nutrition-outline',
    totalLevels: 2,
    isActive: true,
    order: 6
  }
];

export class QuizSeeder {
  static async seedCategories(): Promise<void> {
    try {
      console.log('Seeding categories...');
      
      for (const categoryData of categories) {
        await Category.findOneAndUpdate(
          { id: categoryData.id },
          categoryData,
          { upsert: true, new: true }
        );
      }
      
      console.log('Categories seeded successfully');
    } catch (error) {
      console.error('Error seeding categories:', error);
      throw error;
    }
  }

  static async seedQuizzes(): Promise<void> {
    try {
      console.log('Seeding quiz questions...');
      
      const allQuestions = [
        ...numberQuestions,
        ...animalQuestions
        // Add other question arrays here
      ];

      for (const questionData of allQuestions) {
        await Quiz.findOneAndUpdate(
          { id: questionData.id },
          questionData,
          { upsert: true, new: true }
        );
      }
      
      console.log(`${allQuestions.length} quiz questions seeded successfully`);
    } catch (error) {
      console.error('Error seeding quiz questions:', error);
      throw error;
    }
  }

  static async seedAll(): Promise<void> {
    try {
      await this.seedCategories();
      await this.seedQuizzes();
      console.log('All quiz data seeded successfully');
    } catch (error) {
      console.error('Error seeding quiz data:', error);
      throw error;
    }
  }
}
