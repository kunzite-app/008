import {
  FiUser as UserIcon,
  FiUsers as UsersIcon,
  FiLogOut as LogOutIcon,
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
} from 'react-icons/fi';

export const Icon = ({ icon, size = 16, color = 'black' }) => {
  if (icon === 'unanchor') 
    return <img width={size} height={size} src="assets/icons/unanchor.svg" />
} 

const UnanchorIcon = () => <Icon icon="unanchor" />;

export {
  UserIcon,
  UsersIcon,
  LogOutIcon,
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
  UnanchorIcon,
  SaveIcon,
  LoginIcon,
  ResetIcon,
  SettingsIcon,
  HeadphonesIcon,
  DeleteIcon,
  TrashIcon,
  Share2Icon,
  PlusIcon,
  VideoIcon
};
