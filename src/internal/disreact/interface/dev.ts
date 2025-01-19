import {CI, ConI, EI, HI} from '#src/internal/disreact/interface/index.ts';


export const Public = ConI.makePublic;
export const Private = ConI.makePrivate;
export const Dialog = ConI.makeDialog;


export const Row = CI.Row;
export const Button = CI.Button;
export const SuccessButton = CI.SuccessButton;
export const PrimaryButton = CI.PrimaryButton;
export const SecondaryButton = CI.SecondaryButton;
export const DangerButton = CI.DangerButton;
export const LinkButton = CI.LinkButton;
export const PremiumButton = CI.PremiumButton;
export const Select = CI.Select;
export const UserSelect = CI.UserSelect;
export const RoleSelect = CI.RoleSelect;
export const ChannelSelect = CI.ChannelSelect;
export const MentionSelect = CI.MentionSelect;
export const Text = CI.Text;


export const Header = EI.Header;
export const Body = EI.Body;
export const DialogLink = EI.DialogLink;


export const useNext = HI.useNext;
