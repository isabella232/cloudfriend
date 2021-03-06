'use strict';

/**
 * Creates an SQS queue with an attached dead-letter queue.
 *
 * Standard (non-FIFO) queues can receive messages through an SNS topic. The
 * shortcut either creates a new SNS topic that can be used for sending messages
 * into the queue, or subscribes the queue to an existing SNS topic provided
 * with the `ExistingTopicArn` option. For FIFO queues, no SNS topic is created
 * and `ExistingTopicArn` is ignored.
 *
 * @param {Object} options - Options.
 * @param {String} options.LogicalName - The logical name of the SQS queue
 * within the CloudFormation template. This is also used to construct the logical
 * names of the other resources.
 * @param {Number} [options.VisibilityTimeout=300] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-visibilitytimeout).
 * @param {Number} [options.maxReceiveCount=10] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues-redrivepolicy.html#aws-sqs-queue-redrivepolicy-maxcount).
 * @param {Boolean} [options.ContentBasedDeduplication=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#cfn-sqs-queue-contentbaseddeduplication).
 * @param {Number} [options.DelaySeconds=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-delayseconds).
 * @param {Boolean} [options.FifoQueue=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#cfn-sqs-queue-fifoqueue).
 * @param {String} [options.KmsMasterKeyId=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-kmsmasterkeyid).
 * @param {Number} [options.KmsDataKeyReusePeriodSeconds=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-kmsdatakeyreuseperiodseconds).
 * @param {Number} [options.MaximumMessageSize=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-maxmsgsize).
 * @param {Number} [options.MessageRetentionPeriod=1209600] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-msgretentionperiod).
 * @param {String} [options.QueueName='${stack name}-${logical name}'] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-name).
 * If `FifoQueue` is `true`, the suffix `.fifo` will be added to the queue name.
 * @param {Number} [options.ReceiveMessageWaitTimeSeconds=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-receivemsgwaittime).
 * @param {String} [options.Condition=undefined] - If there is a `Condition` defined
 * in the template that should control whether to create this SQS queue,
 * specify the name of the condition here. See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-section-structure.html).
 * @param {String} [options.DependsOn=undefined] - Specify a stack resource dependency
 * to this SQS queue. See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-dependson.html).
 * @param {String} [options.ExistingTopicArn] - Specify an SNS topic ARN to subscribe the queue to.
 * If this option is provided, `TopicName` is irrelevant because no new topic is created.
 * This option is ignored if `FifoQueue: true`, because FIFO queues cannot subscribe to SNS topics.
 * @param {String} [options.TopicName='${stack name}-${logical name}'] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html#cfn-sns-topic-name).
 * This option is ignored if `FifoQueue: true`, because FIFO queues cannot subscribe to SNS topics.
 * @param {String} [options.DisplayName=undefined] - See [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html#cfn-sns-topic-displayname).
 * @param {Number} [options.DeadLetterVisibilityTimeout=300] - [VisibilityTimeout](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html#aws-sqs-queue-visibilitytimeout) for the dead-letter queue.
 *
 * @example
 * const cf = require('@mapbox/cloudfriend');
 *
 * const myTemplate = { ... };
 *
 * const queue = new cf.shortcuts.Queue({
 *   LogicalName: 'MyQueue'
 * });
 *
 * module.exports = cf.merge(myTemplate, queue);
 */
class Queue {
  constructor(options) {
    if (!options) throw new Error('Options required');
    const {
      LogicalName,
      VisibilityTimeout = 300,
      maxReceiveCount = 10,
      ContentBasedDeduplication,
      DelaySeconds,
      KmsMasterKeyId,
      KmsDataKeyReusePeriodSeconds,
      MaximumMessageSize,
      MessageRetentionPeriod = 1209600,
      QueueName = { 'Fn::Sub': `\${AWS::StackName}-${LogicalName}` },
      ReceiveMessageWaitTimeSeconds,
      Condition = undefined,
      DependsOn = undefined,
      ExistingTopicArn,
      TopicName = { 'Fn::Sub': `\${AWS::StackName}-${LogicalName}` },
      DisplayName,
      DeadLetterVisibilityTimeout = 300
    } = options;

    const required = [LogicalName];
    if (required.some((variable) => !variable))
      throw new Error('You must provide a LogicalName');

    // CFN validation says FifoQueue cannot be false: it must be true or undefined.
    const FifoQueue = options.FifoQueue || undefined;

    this.Resources = {
      [LogicalName]: {
        Type: 'AWS::SQS::Queue',
        Condition,
        DependsOn,
        Properties: {
          ContentBasedDeduplication,
          DelaySeconds,
          FifoQueue,
          KmsMasterKeyId,
          KmsDataKeyReusePeriodSeconds,
          MaximumMessageSize,
          MessageRetentionPeriod,
          // FIFO queue names must have the  .fifo suffix.
          QueueName: FifoQueue
            ? { 'Fn::Sub': ['${queue}.fifo', { queue: QueueName }] }
            : QueueName,
          ReceiveMessageWaitTimeSeconds,
          RedrivePolicy: {
            maxReceiveCount,
            deadLetterTargetArn: {
              'Fn::GetAtt': [`${LogicalName}DeadLetter`, 'Arn']
            }
          },
          VisibilityTimeout
        }
      },

      [`${LogicalName}DeadLetter`]: {
        Type: 'AWS::SQS::Queue',
        Condition,
        Properties: {
          MessageRetentionPeriod: 1209600,
          VisibilityTimeout: DeadLetterVisibilityTimeout,
          // The dead-letter queue's type must match the main queue's type.
          FifoQueue,
          QueueName: FifoQueue
            ? { 'Fn::Sub': ['${queue}-dead-letter.fifo', { queue: QueueName }] }
            : { 'Fn::Sub': ['${queue}-dead-letter', { queue: QueueName }] }
        }
      }
    };

    // FIFO queues cannot subscribe to SNS topics.
    if (!FifoQueue) {
      let subscribedExistingTopicArn = ExistingTopicArn;
      if (!subscribedExistingTopicArn) {
        this.Resources[`${LogicalName}Topic`] = {
          Type: 'AWS::SNS::Topic',
          Condition,
          Properties: {
            TopicName,
            DisplayName
          }
        };
        subscribedExistingTopicArn = { Ref: `${LogicalName}Topic` };
      }

      this.Resources[`${LogicalName}Subscription`] = {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'sqs',
          TopicArn: subscribedExistingTopicArn,
          Endpoint: { 'Fn::GetAtt': [LogicalName, 'Arn'] }
        }
      };

      this.Resources[`${LogicalName}Policy`] = {
        Type: 'AWS::SQS::QueuePolicy',
        Condition,
        Properties: {
          Queues: [{ Ref: LogicalName }],
          PolicyDocument: {
            Version: '2008-10-17',
            Id: LogicalName,
            Statement: [
              {
                Sid: LogicalName,
                Effect: 'Allow',
                Action: 'sqs:SendMessage',
                Principal: { AWS: '*' },
                Resource: { 'Fn::GetAtt': [LogicalName, 'Arn'] },
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': subscribedExistingTopicArn
                  }
                }
              }
            ]
          }
        }
      };
    }
  }
}

module.exports = Queue;
