// alert, alertdialog, application, article, banner, button, cell, checkbox,
// columnheader, combobox, complementary, contentinfo, definition, dialog,
// directory, document, feed, figure, form, grid, gridcell, group, heading, img,
// link, list, listbox, listitem, log, main, marquee, math, menubar, navigation,
// none, note, option, presentation, progressbar, radio, radiogroup, region,
// row, rowgroup, rowheader, scrollbar, search, searchbox, separator, slider,
// spinbutton, status, switch, tab, table, tablist, tabpanel, term, textbox,
// timer, toolbar, tooltip, tree, treegrid, treeitem
export const waiAriaRoleRegExp = /^(alert(?:dialog)?|a(?:pplication|rticle)|banner|c(?:ell|heckbox|o(?:lumnheader|m(?:bobox|plementary)|ntentinfo))|d(?:efinition|(?:i(?:alog|rectory))|ocument)|f(?:eed|igure|orm)|(?:g(?:rid(?:cell)?|roup))|heading|img|l(?:i(?:nk|st(?:box|item)?)|og)|m(?:a(?:in|rquee|th)|enubar)|n(?:avigation|o(?:[nt]e))|option|pr(?:esentation|ogressbar)|r(?:adio(?:group)?|egion|ow(?:group|header)?)|s(?:crollbar|e(?:arch(?:box)?|parator)|lider|tatus|witch)|(?:spin)?button|t(?:ab(?:l(?:e|ist)|panel)?|e(?:rm|xtbox)|imer|ool(?:bar|tip)|ree(?:grid|item)?))$/i

export const isWaiAriaRole = (role: string): boolean =>
  waiAriaRoleRegExp.test(role)

// aria-activedescendant, aria-atomic, aria-autocomplete, aria-busy,
// aria-checked, aria-colcount, aria-colindex, aria-colspan, aria-controls,
// aria-current, aria-describedby, aria-details, aria-dialog, aria-disabled,
// aria-dropeffect, aria-errormessage, aria-expanded, aria-flowto, aria-grabbed,
// aria-haspopup, aria-hidden, aria-invalid, aria-keyshortcuts, aria-label,
// aria-labelledby, aria-level, aria-live, aria-multiline, aria-multiselectable,
// aria-orientation, aria-owns, aria-placeholder, aria-posinset, aria-pressed,
// aria-readonly, aria-relevant, aria-required, aria-roledescription,
// aria-rowcount, aria-rowindex, aria-rowspan, aria-selected, aria-setsize,
// aria-sort, aria-valuemax, aria-valuemin, aria-valuenow, aria-valuetext
export const waiAriaAttributeRegExp = /^aria-(?:a(?:ctivedescendant|tomic|utocomplete)|busy|c(?:hecked|o(?:l(?:count|index|span)ntrols)|urrent)|d(?:e(?:scribedby|tails)|i(?:alog|sabled)|ropeffect)|e(?:rrormessage|xpanded)|flowto|grabbed|h(?:aspopup|idden)|invalid|keyshortcuts|l(?:abel(?:ledby)?|evel|ive)|multi(?:line|selectable)|o(?:rientation|wns)|p(?:laceholder|osinset|ressed)|r(?:e(?:adonly|levant|quired)|o(?:ledescription|w(?:count|index|span)))|s(?:e(?:lected|tsize)|ort)|value(?:m(?:ax|in)|now|text))$/

export const isWaiAriaAttribute = (name: string): boolean =>
  waiAriaAttributeRegExp.test(name)
