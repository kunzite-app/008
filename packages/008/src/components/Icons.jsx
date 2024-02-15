import {
  FiUser as UserIcon,
  FiUsers as UsersIcon,
  FiClock as ClockIcon,
  FiX as XIcon,
  FiAnchor as AnchorIcon,
  FiGrid as GridIcon,
  FiCheck as CheckIcon,
  FiMicOff as MicOffIcon,
  FiPlay as PlayIcon,
  FiPause as PauseIcon,
  FiPhone as PhoneIcon,
  FiPhoneForwarded as PhoneForwardedIcon,
  FiPhoneOff as PhoneOffIcon,
  FiPhoneIncoming as PhoneIncomingIcon,
  FiPhoneOutgoing as PhoneOutgoingIcon,
  FiSave as SaveIcon,
  FiLogIn as LoginIcon,
  FiRotateCcw as ResetIcon,
  FiSettings as SettingsIcon,
  FiHeadphones as HeadphonesIcon,
  FiDelete as DeleteIcon,
  FiTrash as TrashIcon,
  FiShare2 as Share2Icon,
  FiPlus as PlusIcon,
  FiVideo as VideoIcon,
  FiChevronDown as ChevronIcon,
  FiEyeOff  as EyeIcon,
  FiSearch as SearchIcon,
  FiChevronRight as ChevronRightIcon,
  FiChevronDown as ChevronDownIcon,
} from 'react-icons/fi';

export const Icon = ({ icon, size = 16 }) => {
  if (icon === 'unanchor') 
    return <img width={size} height={size} src="assets/icons/unanchor.svg" />
  
  if (icon === 'q')
    return <img width={size} height={size} src="assets/icons/008.svg" />
} 

const UnanchorIcon = (props) => <Icon {...props} icon="unanchor" />;
const QIcon = (props) => <Icon {...props} icon="q" />;

export {
  UserIcon,
  UsersIcon,
  ClockIcon,
  XIcon,
  AnchorIcon,
  GridIcon,
  CheckIcon,
  MicOffIcon,
  PlayIcon,
  PauseIcon,
  PhoneIcon,
  PhoneForwardedIcon,
  PhoneOffIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
  SaveIcon,
  LoginIcon,
  ResetIcon,
  SettingsIcon,
  HeadphonesIcon,
  DeleteIcon,
  TrashIcon,
  Share2Icon,
  PlusIcon,
  VideoIcon,
  ChevronIcon,
  EyeIcon,
  SearchIcon,
  ChevronRightIcon,
  ChevronDownIcon,

  UnanchorIcon,
  QIcon,
};
