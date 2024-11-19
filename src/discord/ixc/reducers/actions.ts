import {makeId} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';


/**
 * @desc Action Name (AXN)
 */
export const AXN = {
    FU_OPEN     : makeId(RDXK.FIRST, 'FU'),
    FU_TZ_UPDATE: makeId(RDXK.FIRST, 'FUTZU'),
    FU_QH_UPDATE: makeId(RDXK.FIRST, 'FUQSU'),
    FU_QE_UPDATE: makeId(RDXK.FIRST, 'FIRST_UPDATE_QUIET_END'),
    FU_SUBMIT   : makeId(RDXK.FIRST, 'FIRST_USER_SUBMIT'),


    LINKS_ENTRY       : makeId(RDXK.ENTRY, 'LX'),
    LINKS_OPEN        : makeId(RDXK.OPEN, 'LX'),
    NLINK_OPEN        : makeId(RDXK.OPEN, 'NEW_LINK'),
    NLINK_UPDATE      : makeId(RDXK.UPDATE, 'NEW_LINK'),
    NLINK_MODAL_OPEN  : makeId(RDXK.MODAL_OPEN, 'NEW_LINK'),
    NLINK_MODAL_SUBMIT: makeId(RDXK.MODAL_SUBMIT, 'NEW_LINK'),
    NLINK_TAG         : makeId(RDXK.TEXT, 'TAG'),
    NLINK_API         : makeId(RDXK.TEXT, 'API'),


    NLINK_CLAN_OPEN        : makeId(RDXK.OPEN, 'NLC'),
    NLINK_CLAN_MODAL_OPEN  : makeId(RDXK.MODAL_OPEN, 'NLC'),
    NLINK_CLAN_MODAL_SUBMIT: makeId(RDXK.MODAL_SUBMIT, 'NLC'),
    NLINK_CLAN_TAG         : makeId(RDXK.TEXT, 'TAGC'),
    NLINK_CLAN_API         : makeId(RDXK.TEXT, 'APIC'),


    ACCOUNTS_OPEN         : makeId(RDXK.OPEN, 'ACC'),
    ACCOUNTS_SELECT       : makeId(RDXK.START, 'ACC'),
    ACCOUNTS_SELECT_UPDATE: makeId(RDXK.UPDATE, 'ACC'),
    ACCOUNT_TYPE_OPEN     : makeId(RDXK.OPEN, 'ACCT'),
    ACCOUNT_TYPE_UPDATE   : makeId(RDXK.UPDATE, 'ACCT'),
    ACCOUNT_TYPE_SUBMIT   : makeId(RDXK.SUBMIT, 'ACCT'),
    ACCOUNT_DELETE_OPEN   : makeId(RDXK.OPEN, 'ACCD'),
    ACCOUNT_DELETE_SUBMIT : makeId(RDXK.DELETE, 'ACCD'),


    INFO_ENTRY  : makeId(RDXK.ENTRY, 'INFO'),
    INFO_OPEN   : makeId(RDXK.OPEN, 'INFO'),
    CLANS_OPEN  : makeId(RDXK.OPEN, 'CLAN'),
    CLANS_SELECT: makeId(RDXK.SELECT, 'CLAN'),
    CLANS_FILTER: makeId(RDXK.FILTER, 'CLAN'),


    ROSTER_ENTRY        : makeId(RDXK.ENTRY, 'ROSTER'),
    ROSTER_OPEN         : makeId(RDXK.OPEN, 'ROSTER'),
    ROSTER_JOIN_OPEN    : makeId(RDXK.OPEN, 'ROSTER_JOIN'),
    ROSTER_SELECT_OPEN  : makeId(RDXK.SELECT, 'ROSTER'),
    ROSTER_SELECT_FILTER: makeId(RDXK.FILTER, 'ROSTER'),
    ROSTER_SELECT_UPDATE: makeId(RDXK.UPDATE, 'ROSTER'),


    ROSTER_ADMIN_OPEN   : makeId(RDXK.ADMIN, 'ROSTER'),
    ROSTER_CREATE       : makeId(RDXK.CREATE, 'ROSTER'),
    ROSTER_CREATE_SUBMIT: makeId(RDXK.SUBMIT, 'ROSTER'),
    ROSTER_EDIT         : makeId(RDXK.EDIT, 'ROSTER'),
    ROSTER_EDIT_SUBMIT  : makeId(RDXK.SUBMIT, 'ROSTER'),
    ROSTER_DELETE       : makeId(RDXK.DELETE, 'ROSTER'),
    ROSTER_DELETE_SUBMIT: makeId(RDXK.DELETE, 'ROSTER'),


    USER_OPEN     : makeId(RDXK.OPEN, 'USER'),
    USER_TZ_OPEN  : makeId(RDXK.OPEN, 'TIMEZONE'),
    USER_TZ_UPDATE: makeId(RDXK.UPDATE, 'TIMEZONE'),
    USER_TZ_SUBMIT: makeId(RDXK.SUBMIT, 'TIMEZONE'),


    NOOP : makeId(RDXK.NOOP, 'NOOP'),
    NOOP1: makeId(RDXK.NOOP, 'NOOP1'),
    NOOP2: makeId(RDXK.NOOP, 'NOOP2'),
    NOOP3: makeId(RDXK.NOOP, 'NOOP3'),
} as const;
