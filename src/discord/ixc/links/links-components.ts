import {makeButton} from '#src/discord/ixc/make/components.ts';
import {IXCBS} from '#src/discord/util/discord.ts';


export const LinksEntryB = makeButton('EntryLinksButton', {
    label: 'Links',
    style: IXCBS.SUCCESS,
});


export const NewLinkB = makeButton('LinksNewLinkButton', {
    label: 'New Link',
    style: IXCBS.SUCCESS,
});


// {k, v} *record* of arbitrary length n
// create a double linked list between keys ordered arbitrarily as ns
//
// also all that discord state stuff lol

// ----------- n^2 -----------------
//  |       |      |      |
//  c0 <=> c1 <=> c2 <=> c3
//  |       |      |      |
// ------------ n^2 -----------------------


//
//
//
//


// const thing = () => makeSelectSubmit(
//     'testmctest',
//     LinkAccountStart,
//     thing2,
//     {
//         options: [{
//             value: 'testmctest3',
//             label: 'testmctest3',
//         }, {
//             value: 'testmctest4',
//             label: 'testmctest4',
//         }],
//     },
// );
//
// const thing2 = () => makeSelectSubmit(
//     'testmctest2',
//     thing,
//     ManageAccounts,
//     {
//         options: [{
//             value: 'testmctest',
//             label: 'testmctest',
//         }, {
//             value: 'testmctest2',
//             label: 'testmctest2',
//         }],
//     },
// );
