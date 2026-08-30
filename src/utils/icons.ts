import {
  School,
  GraduationCap,
  ClipboardList,
  Presentation,
  BookOpen,
  NotebookPen,
  KeyRound,
  User,
  BarChart3,
  Search,
  Home,
  FileText,
  FlaskConical,
  Plus,
  Pencil,
  type LucideIcon,
} from 'lucide-vue-next'

export const iconRegistry: Record<string, LucideIcon> = {
  school: School,
  student: GraduationCap,
  applications: ClipboardList,
  teacher: Presentation,
  course: BookOpen,
  journal: NotebookPen,
  password: KeyRound,
  profile: User,
  stats: BarChart3,
  search: Search,
  home: Home,
  paragraph: FileText,
  quiz: FlaskConical,
  new: Plus,
  edit: Pencil,
  assignment: NotebookPen,
}

export function getIcon(name?: string): LucideIcon | undefined {
  if (!name) return undefined
  return iconRegistry[name]
}
