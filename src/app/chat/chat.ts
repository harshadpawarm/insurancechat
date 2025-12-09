import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define the structure for a conversational node
interface ChatNode {
  text: string; // The text displayed for the option
  isQuestion: boolean; // Is this a question category or a final answer?
  subNodes?: ChatNode[]; // Nested questions or options
  response?: string; // The bot's response if it's a leaf node
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  public messages = signal<{ text: string; isUser: boolean }[]>([]);
  public currentMessage = signal('');

  // The entire conversation tree
  private fullTree: ChatNode[] = [
    {
      text: 'Policy Information',
      isQuestion: true,
      subNodes: [
        {
          text: 'What is my policy number?',
          isQuestion: false,
          response: 'Your policy number is #12345-XYZ.',
        },
        {
          text: 'What is my deductible?',
          isQuestion: false,
          response: 'Your deductible for comprehensive coverage is $500.',
        },
        {
          text: 'View policy documents',
          isQuestion: false,
          response: 'You can view your policy documents in the documents section of our website.',
        },
        {
          text: 'Go back',
          isQuestion: true,
          subNodes: [], // This will be replaced by the root
        },
      ],
    },
    {
      text: 'File a Claim',
      isQuestion: true,
      subNodes: [
        {
          text: 'How do I file a claim?',
          isQuestion: false,
          response: 'You can file a claim through our website or by calling our support line at 1-800-INSURE-ME.',
        },
        {
          text: 'Check claim status',
          isQuestion: false,
          response: 'To check your claim status, please provide your claim number.',
        },
        {
          text: 'Go back',
          isQuestion: true,
          subNodes: [], // This will be replaced by the root
        },
      ],
    },
    {
      text: 'Coverage Questions',
      isQuestion: true,
      subNodes: [
        {
          text: 'Is my new driver covered?',
          isQuestion: false,
          response: 'To add a new driver, we need their driver\'s license number and date of birth.',
        },
        {
          text: 'Does my policy cover rental cars?',
          isQuestion: false,
          response: 'Rental car coverage depends on your specific policy. I can check for you if you provide your policy number.',
        },
        {
          text: 'Go back',
          isQuestion: true,
          subNodes: [], // This will be replaced by the root
        },
      ],
    },
  ];

  // The currently displayed questions for the user to select
  public currentQuestions = signal<ChatNode[]>([]);

  constructor() {
    // Set the 'Go back' nodes to point to the root of the tree
    this.fullTree.forEach(node => {
        const goBackNode = node.subNodes?.find(sn => sn.text === 'Go back');
        if (goBackNode) {
            goBackNode.subNodes = this.fullTree;
        }
    });
    this.currentQuestions.set(this.fullTree);
  }

  selectQuestion(node: ChatNode) {
    // Add user's selection to messages
    this.messages.update(messages => [...messages, { text: node.text, isUser: true }]);

    // If the node has a final response, show it and reset questions
    if (node.response) {
        setTimeout(() => {
            this.messages.update(messages => [...messages, { text: node.response!, isUser: false }]);
            // After answer, show a button to go back to the start
            this.currentQuestions.set([{
                text: 'Start Over',
                isQuestion: true,
                subNodes: this.fullTree
            }]);
        }, 1000);
    } else if (node.subNodes) {
      // If it has sub-questions, display them
      this.currentQuestions.set(node.subNodes);
    }
  }

  sendMessage() {
    const userMessage = this.currentMessage().trim();
    if (userMessage) {
      this.messages.update(messages => [...messages, { text: userMessage, isUser: true }]);
      this.currentMessage.set('');

      // Respond that the user should use the buttons
      setTimeout(() => {
        this.messages.update(messages => [...messages, { text: 'Please select an issue from the options.', isUser: false }]);
      }, 1000);
    }
  }
}
