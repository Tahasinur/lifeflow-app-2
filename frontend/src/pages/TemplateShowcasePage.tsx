import { useState } from 'react';
import { Download, Star, Users, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  author: string;
  uses: number;
  rating: number;
  image?: string;
}

const DEMO_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Project Management System',
    description: 'A comprehensive template for managing projects, tasks, and team collaboration.',
    icon: '📋',
    category: 'Business',
    author: 'Lifeflow Team',
    uses: 1234,
    rating: 4.8,
    image: '📋'
  },
  {
    id: '2',
    title: 'Personal Budget Tracker',
    description: 'Track your income, expenses, and savings with detailed analytics and reports.',
    icon: '💰',
    category: 'Finance',
    author: 'Finance Expert',
    uses: 892,
    rating: 4.7,
    image: '💰'
  },
  {
    id: '3',
    title: 'Content Calendar',
    description: 'Plan and organize your content creation schedule across multiple platforms.',
    icon: '📅',
    category: 'Content',
    author: 'Creator Pro',
    uses: 654,
    rating: 4.9,
    image: '📅'
  },
  {
    id: '4',
    title: 'Learning Progress Tracker',
    description: 'Monitor your learning journey with courses, notes, and progress tracking.',
    icon: '📚',
    category: 'Education',
    author: 'Learning Guru',
    uses: 2103,
    rating: 4.6,
    image: '📚'
  },
  {
    id: '5',
    title: 'Event Planning Template',
    description: 'Organize events with guest lists, budgets, timelines, and checklists.',
    icon: '🎉',
    category: 'Events',
    author: 'Event Manager',
    uses: 543,
    rating: 4.8,
    image: '🎉'
  },
  {
    id: '6',
    title: 'Product Launch Checklist',
    description: 'Complete checklist for launching products with marketing, sales, and support tasks.',
    icon: '🚀',
    category: 'Product',
    author: 'Product Team',
    uses: 1876,
    rating: 4.9,
    image: '🚀'
  }
];

export function TemplateShowcasePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Business', 'Finance', 'Content', 'Education', 'Events', 'Product'];
  
  const filteredTemplates = selectedCategory === 'All' 
    ? DEMO_TEMPLATES 
    : DEMO_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template: Template) => {
    toast.success(`Template "${template.title}" added to your workspace!`);
  };

  const handleAuthorClick = (authorName: string) => {
    navigate(`/user/${authorName}`);
  };

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#191919]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#191919] border-b border-gray-200 dark:border-[#2F2F2F] px-8 py-6">
        <h1 className="text-3xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-2">
          Template Showcase
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore and use professionally designed templates to get started quickly
        </p>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#37352F] dark:text-[#E3E3E3] mb-3">
            CATEGORIES
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] hover:bg-gray-200 dark:hover:bg-[#3F3F3F]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2F2F2F] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Template Preview */}
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#2F2F2F] dark:to-[#3F3F3F] flex items-center justify-center border-b border-gray-200 dark:border-[#2F2F2F]">
                <span className="text-6xl">{template.icon}</span>
              </div>

              {/* Template Info */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#37352F] dark:text-[#E3E3E3] mb-2">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{template.uses.toLocaleString()} uses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Author */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2F2F2F]">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    by{' '}
                    <button
                      onClick={() => handleAuthorClick(template.author)}
                      className="text-[#37352F] dark:text-[#E3E3E3] hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors font-medium"
                    >
                      {template.author}
                    </button>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                  <button
                    onClick={() => toast.info('Preview feature coming soon')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] text-[#37352F] dark:text-[#E3E3E3] text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-[#2F2F2F] transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
