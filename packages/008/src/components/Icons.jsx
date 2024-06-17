import {
  FiUser as UserIcon,
  FiUsers as UsersIcon,
  FiClock as ClockIcon,
  FiX as XIcon,
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
  FiSettings as SettingsIcon,
  FiHeadphones as HeadphonesIcon,
  FiDelete as DeleteIcon,
  FiTrash as TrashIcon,
  FiShare2 as Share2Icon,
  FiPlus as PlusIcon,
  FiVideo as VideoIcon,
  FiEyeOff  as EyeIcon,
  FiSearch as SearchIcon,
  FiChevronRight as ChevronRightIcon,
  FiChevronDown as ChevronDownIcon,

  FiAnchor as AnchorIcon,
} from 'react-icons/fi';

const q = require('../../web/assets/icons/008.svg');
const unanchor = require('../../web/assets/icons/unanchor.svg');

export const Icon = ({ icon, ...props }) => {
  const { size } = props;
  if (icon === 'unanchor') 
    return <img width={size} height={size} src={unanchor} />
  
  if (icon === 'q')
    return <img width={size} height={size} src={q} />
  
  if (icon === 'settings') return <SettingsIcon { ...props } />;
  if (icon === 'anchor') return <AnchorIcon { ...props } />;
  if (icon === 'chevron-right') return <ChevronRightIcon { ...props } />;
  if (icon === 'chevron-down') return <ChevronDownIcon { ...props } />;
  if (icon === 'phone-outgoing') return <PhoneOutgoingIcon { ...props } />;
  if (icon === 'phone-incoming') return <PhoneIncomingIcon { ...props } />;
  if (icon === 'phone-forwarded') return <PhoneForwardedIcon { ...props } />;
  if (icon === 'hang') return <PhoneOffIcon { ...props } />;
  if (icon === 'mic-off') return <MicOffIcon { ...props } />;
  if (icon === 'play') return <PlayIcon { ...props } />;
  if (icon === 'pause') return <PauseIcon { ...props } />;
  if (icon === 'grid') return <GridIcon { ...props } />;
  if (icon === 'clock') return <ClockIcon { ...props } />;
  if (icon === 'users') return <UsersIcon { ...props } />;
  if (icon === 'user') return <UserIcon { ...props } />;
  if (icon === 'headphones') return <HeadphonesIcon { ...props }/>;
  if (icon === 'phone') return <PhoneIcon { ...props } />;
  if (icon === 'delete') return <DeleteIcon { ...props } />;
  if (icon === 'trash') return <TrashIcon { ...props } />;
  if (icon === 'share-2') return <Share2Icon { ...props } />;
  if (icon === 'plus') return <PlusIcon { ...props } />;
  if (icon === 'video') return <VideoIcon { ...props } />;
  if (icon === 'check') return <CheckIcon { ...props } />;
  if (icon === 'x') return <XIcon { ...props } />;
  if (icon === 'eye') return <EyeIcon { ...props } />;
  if (icon === 'search') return <SearchIcon { ...props } />;
}
