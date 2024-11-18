import {buildPredicate} from '#src/discord/ixc/store/build-reducer.ts';
import {RDXK, RDXT} from '#src/discord/ixc/store/types.ts';


export const AXN_FIRST = {
    FIRST_USER              : buildPredicate(RDXK.FIRST, RDXT.FIRST_USER),
    FIRST_UPDATE_TIMEZONE   : buildPredicate(RDXK.FIRST, RDXT.FIRST_UPDATE_TIMEZONE),
    FIRST_UPDATE_QUIET_START: buildPredicate(RDXK.FIRST, RDXT.FIRST_UPDATE_QUIET_START),
    FIRST_UPDATE_QUIET_END  : buildPredicate(RDXK.FIRST, RDXT.FIRST_UPDATE_QUIET_END),
    FIRST_USER_SUBMIT       : buildPredicate(RDXK.FIRST, RDXT.FIRST_USER_SUBMIT),
    FIRST_ACCOUNT           : buildPredicate(RDXK.FIRST, RDXT.FIRST_ACCOUNT),
};


/**
 * @desc Action Name (AXN)
 */
export const AXN = {
    ENTRY_LINKS: buildPredicate(RDXK.ENTRY, RDXT.LINKS),
    START_LINKS: buildPredicate(RDXK.EDIT, RDXT.LINKS),


    START_NEW_LINK: buildPredicate(RDXK.EDIT, RDXT.NEW_LINK),


    START_ACCOUNTS: buildPredicate(RDXK.EDIT, RDXT.ACCOUNTS),

    START_SELECT_ACCOUNT : buildPredicate(RDXK.START, RDXT.ACCOUNTS),
    UPDATE_SELECT_ACCOUNT: buildPredicate(RDXK.UPDATE, RDXT.ACCOUNTS),

    START_ACCOUNT_TYPE : buildPredicate(RDXK.START, RDXT.ACCOUNT_TYPE),
    UPDATE_ACCOUNT_TYPE: buildPredicate(RDXK.UPDATE, RDXT.ACCOUNT_TYPE),
    SUBMIT_ACCOUNT_TYPE: buildPredicate(RDXK.SUBMIT, RDXT.ACCOUNT_TYPE),

    START_DELETE_ACCOUNT : buildPredicate(RDXK.START, RDXT.DELETE_ACCOUNT),
    SUBMIT_DELETE_ACCOUNT: buildPredicate(RDXK.SUBMIT, RDXT.DELETE_ACCOUNT),


    OPEN_USER: buildPredicate(RDXK.EDIT, RDXT.USER),

    START_TIMEZONE : buildPredicate(RDXK.START, RDXT.TIMEZONE),
    UPDATE_TIMEZONE: buildPredicate(RDXK.UPDATE, RDXT.TIMEZONE),
    SUBMIT_TIMEZONE: buildPredicate(RDXK.SUBMIT, RDXT.TIMEZONE),


    NOOP : buildPredicate(RDXK.NOOP, RDXT.NOOP),
    NOOP1: buildPredicate(RDXK.NOOP, RDXT.NOOP1),
    NOOP2: buildPredicate(RDXK.NOOP, RDXT.NOOP2),
    NOOP3: buildPredicate(RDXK.NOOP, RDXT.NOOP3),
} as const;
