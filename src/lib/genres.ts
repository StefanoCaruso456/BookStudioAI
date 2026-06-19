// ===========================================================================
// Genre configuration — the heart of Book Studio AI's "guided studio" feel.
// Every genre-specific behaviour (sections, audience hints, structured input
// fields, blueprint flavour) is driven from this single config.
// ===========================================================================
import type { BookType, BookGoal } from "@/types/book";

export interface GenreField {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
}

export interface GenreConfig {
  type: BookType;
  label: string;
  tagline: string;
  /** lucide-react icon name, resolved in the GenreTile registry */
  icon: string;
  description: string;
  suggestedSections: string[];
  audienceExamples: string[];
  /** structured questions asked in the genre-specific wizard step */
  fields: GenreField[];
  /** copy shown in the source-content uploader for this genre */
  sourceHint: string;
}

export const BOOK_GOALS: { value: BookGoal; label: string; description: string }[] = [
  { value: "build_authority", label: "Build authority", description: "Become the go-to expert in your space." },
  { value: "sell_to_audience", label: "Sell to my audience", description: "Turn followers and clients into book buyers." },
  { value: "teach_skill", label: "Teach a skill", description: "Help readers learn something practical." },
  { value: "share_story", label: "Share my story", description: "Tell a personal or transformational story." },
  { value: "generate_leads", label: "Generate leads", description: "Use the book as a top-of-funnel magnet." },
  { value: "personal_legacy", label: "Publish for personal legacy", description: "Create something lasting for family or fans." },
];

export const GENRES: GenreConfig[] = [
  {
    type: "cookbook",
    label: "Cookbook",
    tagline: "Recipes & food stories",
    icon: "ChefHat",
    description: "Turn your recipes and kitchen stories into a beautiful, structured cookbook.",
    suggestedSections: ["Breakfast", "Lunch", "Dinner", "Desserts", "Family Recipes", "Holiday Recipes"],
    audienceExamples: ["Home cooks who want weeknight meals", "Fans of Italian comfort food", "Busy parents", "My social media following"],
    sourceHint: "Add recipes, the stories behind them, and any notes about ingredients or technique.",
    fields: [
      { key: "recipeName", label: "Signature recipe name", placeholder: "e.g. Nonna's Sunday Ragù" },
      { key: "ingredients", label: "Key ingredients", placeholder: "List the core ingredients", type: "textarea" },
      { key: "servingSize", label: "Serving size", placeholder: "e.g. Serves 6" },
      { key: "prepTime", label: "Prep time", placeholder: "e.g. 20 minutes" },
      { key: "cookTime", label: "Cook time", placeholder: "e.g. 3 hours" },
      { key: "instructions", label: "Instructions", placeholder: "Outline the steps", type: "textarea" },
      { key: "story", label: "Story behind the recipe", placeholder: "Where does this dish come from?", type: "textarea" },
      { key: "dietaryTags", label: "Dietary tags", placeholder: "e.g. vegetarian, gluten-free" },
      { key: "imageNotes", label: "Image / plating notes", placeholder: "How should the photo look?" },
    ],
  },
  {
    type: "fitness_diet",
    label: "Fitness & Diet",
    tagline: "Programs & nutrition",
    icon: "Dumbbell",
    description: "Package your training and nutrition knowledge into a results-driven program book.",
    suggestedSections: ["Introduction", "Mindset", "Nutrition", "Workouts", "Weekly Plan", "Recovery", "Maintenance"],
    audienceExamples: ["Beginners getting back in shape", "Busy professionals", "Postpartum mothers", "My coaching clients"],
    sourceHint: "Add workouts, meal guidance, and the safety notes your readers need.",
    fields: [
      { key: "fitnessLevel", label: "Target fitness level", placeholder: "e.g. Beginner to intermediate" },
      { key: "programDuration", label: "Program duration", placeholder: "e.g. 8 weeks" },
      { key: "goals", label: "Fitness goals", placeholder: "e.g. Fat loss, strength, energy", type: "textarea" },
      { key: "workouts", label: "Workouts", placeholder: "Outline key workouts or splits", type: "textarea" },
      { key: "mealGuidance", label: "Meal guidance", placeholder: "Nutrition approach & sample meals", type: "textarea" },
      { key: "safety", label: "Safety disclaimers", placeholder: "Any warnings or contraindications", type: "textarea" },
      { key: "progressTracking", label: "Progress tracking", placeholder: "How will readers measure progress?" },
    ],
  },
  {
    type: "coaching_self_help",
    label: "Coaching / Self-Help",
    tagline: "Frameworks & transformation",
    icon: "Sparkles",
    description: "Distill your coaching framework into a transformational self-help book.",
    suggestedSections: ["Problem", "Mindset Shift", "Framework", "Exercises", "Case Studies", "Action Plan"],
    audienceExamples: ["People stuck in their careers", "First-time founders", "Anyone seeking more confidence", "My newsletter subscribers"],
    sourceHint: "Add your framework, the reader's core pain, and the exercises that create change.",
    fields: [
      { key: "framework", label: "Core framework", placeholder: "Name and outline your method", type: "textarea" },
      { key: "painPoint", label: "Reader pain point", placeholder: "What problem are they facing?", type: "textarea" },
      { key: "transformation", label: "Transformation promise", placeholder: "Where will they end up?", type: "textarea" },
      { key: "exercises", label: "Exercises", placeholder: "Practical exercises you use", type: "textarea" },
      { key: "reflectionQuestions", label: "Reflection questions", placeholder: "Questions that prompt insight", type: "textarea" },
      { key: "actionSteps", label: "Action steps", placeholder: "Concrete steps readers take", type: "textarea" },
    ],
  },
  {
    type: "travel_guide",
    label: "Travel Guide",
    tagline: "Destinations & itineraries",
    icon: "Map",
    description: "Shape your destination expertise into a practical, inspiring travel guide.",
    suggestedSections: ["Overview", "Best Time to Go", "Itineraries", "Food", "Neighborhoods", "Activities", "Tips"],
    audienceExamples: ["First-time visitors", "Budget backpackers", "Luxury travelers", "Digital nomads"],
    sourceHint: "Add itineraries, food and hotel picks, and the local tips only you know.",
    fields: [
      { key: "destination", label: "Destination", placeholder: "e.g. Lisbon, Portugal" },
      { key: "travelerType", label: "Traveler type", placeholder: "e.g. Couples, families, solo" },
      { key: "budget", label: "Budget", placeholder: "e.g. Mid-range, $100/day" },
      { key: "tripLength", label: "Trip length", placeholder: "e.g. 5 days" },
      { key: "itinerary", label: "Itinerary notes", placeholder: "Day-by-day highlights", type: "textarea" },
      { key: "food", label: "Food recommendations", placeholder: "Restaurants, dishes, markets", type: "textarea" },
      { key: "safety", label: "Safety tips", placeholder: "What should travelers know?", type: "textarea" },
      { key: "packing", label: "Packing list", placeholder: "Essentials to bring", type: "textarea" },
    ],
  },
  {
    type: "memoir_biography",
    label: "Memoir / Biography",
    tagline: "Life stories & legacy",
    icon: "BookHeart",
    description: "Turn the moments that shaped you into a moving, well-structured memoir.",
    suggestedSections: ["Early Life", "Challenge", "Turning Point", "Growth", "Lessons", "Legacy"],
    audienceExamples: ["My family and descendants", "People who've faced similar struggles", "Fans of my work", "Anyone seeking hope"],
    sourceHint: "Add the timeline of key events, the people in them, and the lessons you carry.",
    fields: [
      { key: "timeline", label: "Timeline", placeholder: "Major periods of your life", type: "textarea" },
      { key: "keyEvents", label: "Key life events", placeholder: "The moments that mattered most", type: "textarea" },
      { key: "people", label: "Important people", placeholder: "Who shaped your story?", type: "textarea" },
      { key: "conflict", label: "Central conflict", placeholder: "The struggle at the heart of it", type: "textarea" },
      { key: "turningPoints", label: "Turning points", placeholder: "Where everything changed", type: "textarea" },
      { key: "lessons", label: "Lessons learned", placeholder: "What you want readers to take away", type: "textarea" },
      { key: "emotionalArc", label: "Emotional arc", placeholder: "From … to …" },
    ],
  },
  {
    type: "business_expert",
    label: "Business / Expert Book",
    tagline: "Thesis & playbooks",
    icon: "Briefcase",
    description: "Convert your expertise into an authority-building business book.",
    suggestedSections: ["Problem", "Market Shift", "Framework", "Case Studies", "Playbook", "Conclusion"],
    audienceExamples: ["Founders and operators", "Mid-career professionals", "Industry decision-makers", "Potential clients"],
    sourceHint: "Add your thesis, frameworks, case studies, and the templates readers can use.",
    fields: [
      { key: "thesis", label: "Core thesis", placeholder: "The big idea of the book", type: "textarea" },
      { key: "audience", label: "Primary audience", placeholder: "Who needs this most?" },
      { key: "framework", label: "Framework", placeholder: "Your signature model or system", type: "textarea" },
      { key: "caseStudies", label: "Case studies", placeholder: "Real examples and results", type: "textarea" },
      { key: "examples", label: "Examples", placeholder: "Supporting stories and data", type: "textarea" },
      { key: "templates", label: "Templates", placeholder: "Tools readers can copy", type: "textarea" },
      { key: "callToAction", label: "Call to action", placeholder: "What should readers do next?" },
    ],
  },
  {
    type: "other",
    label: "Other book type",
    tagline: "Something else",
    icon: "BookOpen",
    description: "Have a different kind of book in mind? Start here and we'll adapt.",
    suggestedSections: ["Introduction", "Part One", "Part Two", "Part Three", "Conclusion"],
    audienceExamples: ["My audience", "Newcomers to the topic", "Peers in my field"],
    sourceHint: "Add any notes, outlines, or content you'd like the book to be built from.",
    fields: [
      { key: "topic", label: "What is the book about?", placeholder: "Describe your topic", type: "textarea" },
      { key: "keyIdeas", label: "Key ideas", placeholder: "The main points to cover", type: "textarea" },
      { key: "outcome", label: "Reader outcome", placeholder: "What will readers gain?", type: "textarea" },
    ],
  },
];

export function getGenre(type: BookType): GenreConfig {
  return GENRES.find((g) => g.type === type) ?? GENRES[GENRES.length - 1];
}

/** The six "primary" tiles shown on the landing page (everything except `other`). */
export const PRIMARY_GENRES = GENRES.filter((g) => g.type !== "other");
