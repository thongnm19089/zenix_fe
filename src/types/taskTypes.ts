type IUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  image: string | null;
};

type ITask = {
  id: number;
  creator: number;
  name: string;
  checklist: number;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  users: IUser[];
};

interface IFile {
  file: string;
  id: number;
  // Các trường khác của 'file' mà bạn có thể đang sử dụng
  // ...
}

type IChecklist = {
  id: number;
  creator: number;
  name: string;
  card: number;
  created_at: string;
  updated_at: string;
  tasks: ITask[];
  card_str: string;
};

type ILabel = {
  id: number;
  created: string;
  name: string;
  color: string;
  user: number;
  board: number;
};

interface IEmoji {
  id: number;
  created: string;
  emoji_code: string;
  user: number;
  user_str: string;
  activity: number;
}

interface IActivity {
  id: number;
  creator: number;
  creator_str: string;
  content: string;
  card: number;
  created_at: string;
  type: string;
  card_str: string;
  type_str: string;
  emojis: IEmoji[];
}

type ICard = {
  list_str: string;
  id: number;
  order: number;
  creator: number;
  name: string;
  start_date: string | null;
  deadline: string | null;
  description: string | null;
  slug: string;
  trello_list: number;
  created_at: string;
  updated_at: string;
  users: IUser[];
  board_slug: string;
  checklist_list: IChecklist[];
  file_list?: IFile[];
  is_completed: boolean;
  label_list?: ILabel[];
  activity_list: IActivity[];
  is_archived?: boolean;
  archived?: boolean;
};

type IList = {
  id: number;
  order: number;
  name: string;
  cards: ICard[];
};

type IBoard = {
  id: number;
  creator: number;
  creator_str: string;
  is_archive: boolean;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  users: IUser[];
  lists: IList[];
  labels?: ILabel[];
  bg_image: string | null;
  bg_color_type: number | null;
  bg_color: string | null;
  type: number | null;
  type_name :any | null;
  copy_count: number;
};

type IProject = {
  id: number;
  manager: number;
  name: string;
  created: string;
  description: string;
  start_date: string;
  end_date: string;
  users: IUser[];
  image: string | null;
  file: string | null;
  team_members: [];
};

export type { IUser, IChecklist, IFile, IActivity, ITask, ICard, IList, IBoard, ILabel, IProject };
