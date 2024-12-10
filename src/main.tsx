import './createPost.js';

import { Devvit, useForm, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Words Game',
  height: 'tall',
  render: (context) => {

    const myForm = useForm(
      {
        fields: [
          {
            type: 'number',
            name: 'playerNumber',
            label: 'Number of players',
            required: true,
            defaultValue: 2,
            min: 2,
            max: 20,
          },
          {
            type: 'number',
            name: 'timeLimit',
            label: 'Time limit for answer (in seconds)',
            required: true,
            defaultValue: 60,
            min: 0.5,
            max: 1000,
          },
          {
            type: 'string',
            name: 'startWord',
            label: 'Starting word',
            required: true,
          },
        ],
      },
      (values) => {
        onShowWebviewClick(values.timeLimit, values.startWord, values.playerNumber);
      }
    );

    // Load username with `useAsync` hook
    // const [username] = useState(async () => {
    //   const currUser = await context.reddit.getCurrentUser();
    //   return currUser?.username ?? 'anon';
    // });

    // Load latest counter from redis with `useAsync` hook
    // const [counter, setCounter] = useState(async () => {
    //   const redisCount = await context.redis.get(`counter_${context.postId}`);
    //   return Number(redisCount ?? 0);
    // });

    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);

    // When the web view invokes `window.parent.postMessage` this function is called
    const onMessage = async (msg: any) => {
      switch (msg.type) {
        // case 'setCounter':
        //   await context.redis.set(`counter_${context.postId}`, msg.data.newCounter.toString());
        //   context.ui.webView.postMessage('myWebView', {
        //     type: 'updateCounter',
        //     data: {
        //       currentCounter: msg.data.newCounter,
        //     },
        //   });
        //   setCounter(msg.data.newCounter);
        //   break;
        case 'initialData':
        case 'updateCounter':
          break;
        case 'gameOver':
          setWebviewVisible(false);
          break

        default:
          throw new Error(`Unknown message type: ${msg}`);
      }
    };

    // When the button is clicked, send initial data to web view and show it
    const onShowWebviewClick = (timeLimit: number, startWord: string, playerNumber: number) => {
      setWebviewVisible(true);
      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: {
          timeLimit,
          startWord,
          playerNumber,
        },
      });
    };

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack
          grow={!webviewVisible}
          height={webviewVisible ? '0%' : '100%'}
          alignment="middle center"
        >
          <text size="xlarge" weight="bold">
            Words Game
          </text>
          <text size="medium" weight="bold">
            Players take turns entering words.
          </text>
          <text size="medium" weight="bold">
            The next word must start with the last letter of the previous word. 
          </text>
          <text size="medium" weight="bold">
            No repeats allowed!
          </text>
          <spacer />
          <spacer />
          <button onPress={() => context.ui.showForm(myForm)}>Launch App</button>
        </vstack>
        <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
          <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg)}
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
