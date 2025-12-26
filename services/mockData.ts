import { Post } from '../types';

const generateMockPosts = (): Post[] => [
  {
    id: '1',
    userId: 'u1',
    username: 'CryptoKing',
    title: 'Pi Network Open Mainnet Roadmap Analysis',
    description: 'Deep dive into the whitepaper updates and what it means for pioneers.',
    url: 'https://youtube.com/watch?v=123',
    category: 'youtube',
    status: 'approved',
    likesCount: 1240,
    viewsCount: 5400,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=1'
  },
  {
    id: '2',
    userId: 'u2',
    username: 'PiCoreFan',
    title: 'Official Core Team Announcement on KYC',
    description: 'Latest updates regarding the mass KYC slots opening up globally.',
    url: 'https://x.com/PiCoreTeam/status/123',
    category: 'x',
    status: 'approved',
    likesCount: 890,
    viewsCount: 3200,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=2'
  },
  {
    id: '3',
    userId: 'u3',
    username: 'Web3Dev',
    title: 'Building dApps on PiOS',
    description: 'A tutorial for developers wanting to contribute to the ecosystem.',
    url: 'https://medium.com/pios-tutorial',
    category: 'article',
    status: 'approved',
    likesCount: 450,
    viewsCount: 1200,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=3'
  },
  {
    id: '4',
    userId: 'u4',
    username: 'VisualArtist',
    title: 'Pi Art Festival Winners',
    description: 'Check out the amazing community submissions for this year.',
    url: 'https://instagram.com/p/123',
    category: 'instagram',
    status: 'approved',
    likesCount: 2100,
    viewsCount: 8000,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=4'
  },
  {
    id: '5',
    userId: 'u5',
    username: 'MerchantPi',
    title: 'Global Pi Barter Mall Launch',
    description: 'Trading goods for Pi is now easier than ever in these regions.',
    url: 'https://pichainmall.com',
    category: 'other',
    status: 'approved',
    likesCount: 670,
    viewsCount: 2200,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=5'
  },
  {
    id: '6',
    userId: 'u6',
    username: 'NodeRunner',
    title: 'Optimize your Node Bonus',
    description: 'Technical guide to increasing your mining rate via node uptime.',
    url: 'https://youtube.com',
    category: 'youtube',
    status: 'approved',
    likesCount: 340,
    viewsCount: 1100,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=6'
  },
  {
    id: '7',
    userId: 'u7',
    username: 'PendingUser',
    title: 'Scam Alert: Watch out for this site',
    description: 'Warning the community about a phishing link circulating.',
    url: 'https://example.com',
    category: 'article',
    status: 'pending',
    likesCount: 0,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=7'
  },
  {
    id: '8',
    userId: 'u8',
    username: 'PiThreads',
    title: 'Daily Discussion Thread',
    description: 'Join the conversation about today\'s mining rates.',
    url: 'https://threads.net/@pi_network',
    category: 'threads',
    status: 'approved',
    likesCount: 150,
    viewsCount: 600,
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/600/400?random=8'
  }
];

export const MOCK_POSTS = generateMockPosts();