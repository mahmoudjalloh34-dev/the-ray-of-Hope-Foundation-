import type { SiteSettings } from './types';

// Shown until the database answers (or if a setting has not been created yet).
// Everything here comes from the foundation's own backgrounder; nothing is invented.
export const DEFAULT_SETTINGS: SiteSettings = {
  org: {
    name: 'The Ray of Hope Foundation',
    tagline: 'Giving Light to Dreams Through Education and Empowerment.',
    email: 'therayofhopefoundationsl@gmail.com', phone: '+232 79 498642', address: 'Freetown, Sierra Leone', registration: '',
  },
  social: { facebook: 'https://www.facebook.com/share/1F7pVt8kRm/', instagram: 'https://www.instagram.com/therayofhopefoundationsl', x: '', linkedin: 'https://www.linkedin.com/company/the-ray-of-hope-foundation-sl/', youtube: '', whatsapp: '' },
  donation: { enabled: false, intro: '', channels: [] },
  impact: { stats: [] },
  faq: { items: [] },
  page_privacy: { html: '' },
  page_terms: { html: '' },
  page_accessibility: { html: '' },
  about: {
    mission: 'To provide educational scholarships, mentorship and career guidance to underprivileged children and youth in Sierra Leone, starting at community level and growing nationally and globally, so that they can become agents of change in society.',
    vision: 'A Sierra Leone where every child and youth, regardless of background, has access to quality education, mentorship and guidance for a brighter future.',
    values: [],
    governance_html: '',
  },
};

export const FOUNDED = '2025';

// Growth plan as described in the foundation's backgrounder. These are plans, not results.
export const PHASES = [
  {
    name: 'Phase 1',
    when: 'Years one and two',
    points: [
      'Register with local authorities',
      'Select two to three pilot communities, such as Freetown suburbs',
      'Identify fifty beneficiaries through schools, churches and community structures',
      'Launch a local mentorship club, the Hope Builders Circle',
      'Host the first Annual Ray of Hope Education Day',
    ],
  },
  {
    name: 'Phase 2',
    when: 'Years three and four',
    points: [
      'Extend activities to all major regions: North, South, East and the Western Area',
      'Build partnerships with local education authorities, schools and youth organisations',
      'Launch a National Mentorship Drive to train volunteers as mentors',
      'Work with radio and television to share stories and promote career tips',
    ],
  },
  {
    name: 'Phase 3',
    when: 'Year five onwards',
    points: [
      'Grow collaboration with diaspora networks and international NGOs',
      'Apply for international grants and recognition programmes',
      'Launch the Ray of Hope International Youth Exchange programme',
      'Establish a small office with a full-time team',
    ],
  },
];

export const WORKS_WITH = [
  'Schools and educational institutions',
  'Churches and community-based organisations',
  'Government ministries, including Education, Youth and Gender',
  'The private sector, for scholarships, mentorship and employment linkage',
  'Media outlets, to share impact stories and raise awareness',
  'Diaspora communities, for funding and volunteering',
];

export const FOUNDER = {
  name: 'Abraham N. Bangura Abu',
  title: 'Founder, Ray of Hope',
  photo: '/images/founder.jpg',
  photoAlt: 'Portrait of Abraham N. Bangura Abu, founder of The Ray of Hope Foundation, smiling in a patterned jacket, blue shirt and red tie',
  paragraphs: [
    'Abraham N. Bangura Abu is a professional communications practitioner, educator and law student whose commitment to education, youth empowerment and community development is deeply rooted in his personal journey. His passion for creating opportunities for young people from underserved communities comes from a belief that every child deserves the chance to learn, grow and fulfil their potential, regardless of their socioeconomic background.',
    'He holds a Bachelor of Arts Honours degree in Mass Communication and a Master of Arts degree in Development Communication. He is currently pursuing a Master of Philosophy degree in Media and Communication Studies and also holds a certificate in Pastoral Theology. Beyond his academic and professional pursuits, Abraham is an active community stakeholder with a longstanding commitment to service, advocacy and youth development.',
    'His inspiration for establishing Ray of Hope emerged from the challenges he met as a young student. Despite being intelligent, hardworking and disciplined, his educational journey was marked by significant obstacles. At critical moments, individuals who had no prior personal connection to him extended support and encouragement that helped him persevere. Their generosity became a powerful reminder that the right intervention, offered at the right time, can transform a young person’s future.',
    'Today, Abraham believes that the credit belongs not only to his personal determination but also to those who chose to believe in him when circumstances seemed overwhelming. Ray of Hope is his way of extending that same opportunity to children growing up in deprived and underserved communities.',
    'His commitment to community development is reflected in his service as former President of the Moyiba Student Union, as well as his involvement in community clean-up exercises, advocacy against drug abuse, and initiatives recognising pupils for outstanding academic performance.',
    'Through Ray of Hope, Abraham envisions a sustainable platform that goes beyond immediate educational assistance. He seeks to establish a coordinated and dedicated mentorship programme through which young people can have their abilities nurtured, their aspirations strengthened and their potential developed. Ultimately, he hopes that the children who benefit today will become tomorrow’s mentors, leaders and change-makers, extending the cycle of hope to generations to come.',
    'Abraham welcomes partnerships, collaboration and support from individuals, institutions, organisations and development partners who share this vision. He believes that meaningful and lasting community transformation cannot be achieved without education, opportunity and collective responsibility.',
  ],
  conviction: 'No child’s future should be determined by the circumstances of their birth.',
};
