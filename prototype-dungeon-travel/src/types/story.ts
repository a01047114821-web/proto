export interface StoryScene {
  id: string;
  speaker?: string;
  text: string;
  image?: string;
  choices?: StoryChoice[];
}

export interface StoryChoice {
  text: string;
  nextScene?: string;
  effect?: () => void;
}

export interface DungeonStory {
  intro: StoryScene[];
  boss: StoryScene[];
  completion: StoryScene[];
}

export type EndingType = 'bad' | 'normal' | 'good' | 'true';