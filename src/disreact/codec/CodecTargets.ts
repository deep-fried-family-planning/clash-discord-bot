// todo
type Todo = any;



export const getRouteFromMessage = (message: Todo): string => {
  return new URL(message.embeds[0].image.url).pathname;
};

export const setRouteForMessage = (message: Todo, route: string): Todo => {
  message.embeds[0].url = new URL(`https://dffp.org/${route}`).href;
  return message;
};



export const getRouteFromDialog = (dialog: Todo): string => {
  return dialog.custom_id;
};

export const setRouteForDialog = (dialog: Todo, route: string): Todo => {
  dialog.custom_id = route;
  return dialog;
};
