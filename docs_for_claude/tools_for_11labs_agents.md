# Create tool

POST https://api.elevenlabs.io/v1/convai/tools
Content-Type: application/json

Add a new tool to the available tools in the workspace.

Reference: https://elevenlabs.io/docs/api-reference/tools/create

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: api
  version: 1.0.0
paths:
  /v1/convai/tools:
    post:
      operationId: create
      summary: Add Tool
      description: Add a new tool to the available tools in the workspace.
      tags:
        - subpackage_conversationalAi.subpackage_conversationalAi/tools
      parameters:
        - name: xi-api-key
          in: header
          required: false
          schema:
            type: string
      responses:
        '200':
          description: Successful Response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/type_:ToolResponseModel'
        '422':
          description: Validation Error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/type_:HTTPValidationError'
      requestBody:
        description: A tool that an agent can provide to LLM.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/type_:ToolRequestModel'
servers:
  - url: https://api.elevenlabs.io
  - url: https://api.us.elevenlabs.io
  - url: https://api.eu.residency.elevenlabs.io
  - url: https://api.in.residency.elevenlabs.io
components:
  schemas:
    type_:DynamicVariableAssignment:
      type: object
      properties:
        source:
          type: string
          enum:
            - response
          description: >-
            The source to extract the value from. Currently only 'response' is
            supported.
        dynamic_variable:
          type: string
          description: The name of the dynamic variable to assign the extracted value to
        value_path:
          type: string
          description: >-
            Dot notation path to extract the value from the source (e.g.,
            'user.name' or 'data.0.id')
        sanitize:
          type: boolean
          default: false
          description: >-
            If true, this assignment's value will be removed from the tool
            response before sending to the LLM and transcript, but still
            processed for variable assignment.
      required:
        - dynamic_variable
        - value_path
      description: >-
        Configuration for extracting values from tool responses and assigning
        them to dynamic variables.
      title: DynamicVariableAssignment
    type_:ToolCallSoundType:
      type: string
      enum:
        - typing
        - elevator1
        - elevator2
        - elevator3
        - elevator4
      description: Predefined tool call sound types.
      title: ToolCallSoundType
    type_:ToolCallSoundBehavior:
      type: string
      enum:
        - auto
        - always
      default: auto
      description: Determines how the tool call sound should be played.
      title: ToolCallSoundBehavior
    type_:ToolErrorHandlingMode:
      type: string
      enum:
        - auto
        - summarized
        - passthrough
        - hide
      default: auto
      description: >-
        Controls how tool errors are processed before being shared with the
        agent.
      title: ToolErrorHandlingMode
    type_:LiteralJsonSchemaPropertyType:
      type: string
      enum:
        - boolean
        - string
        - integer
        - number
      title: LiteralJsonSchemaPropertyType
    type_:LiteralJsonSchemaPropertyConstantValue:
      oneOf:
        - type: string
        - type: integer
        - type: number
          format: double
        - type: boolean
      description: >-
        A constant value to use for this property. Mutually exclusive with
        description, dynamic_variable, and is_system_provided.
      title: LiteralJsonSchemaPropertyConstantValue
    type_:LiteralJsonSchemaProperty:
      type: object
      properties:
        type:
          $ref: '#/components/schemas/type_:LiteralJsonSchemaPropertyType'
        description:
          type: string
          default: ''
          description: >-
            The description of the property. When set, the LLM will provide the
            value based on this description. Mutually exclusive with
            dynamic_variable, is_system_provided, and constant_value.
        enum:
          type: array
          items:
            type: string
          description: List of allowed string values for string type parameters
        is_system_provided:
          type: boolean
          default: false
          description: >-
            If true, the value will be populated by the system at runtime. Used
            by API Integration Webhook tools for templating. Mutually exclusive
            with description, dynamic_variable, and constant_value.
        dynamic_variable:
          type: string
          default: ''
          description: >-
            The name of the dynamic variable to use for this property's value.
            Mutually exclusive with description, is_system_provided, and
            constant_value.
        constant_value:
          $ref: '#/components/schemas/type_:LiteralJsonSchemaPropertyConstantValue'
          description: >-
            A constant value to use for this property. Mutually exclusive with
            description, dynamic_variable, and is_system_provided.
      required:
        - type
      description: >-
        Schema property for literal JSON types. IMPORTANT: Only ONE of the
        following fields can be set: description (LLM provides value),
        dynamic_variable (value from variable), is_system_provided (system
        provides value), or constant_value (fixed value). These are mutually
        exclusive.
      title: LiteralJsonSchemaProperty
    type_:ArrayJsonSchemaPropertyInputItems:
      oneOf:
        - $ref: '#/components/schemas/type_:LiteralJsonSchemaProperty'
        - $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyInput'
        - $ref: '#/components/schemas/type_:ArrayJsonSchemaPropertyInput'
      title: ArrayJsonSchemaPropertyInputItems
    type_:ArrayJsonSchemaPropertyInput:
      type: object
      properties:
        type:
          type: string
          enum:
            - array
        description:
          type: string
          default: ''
        items:
          $ref: '#/components/schemas/type_:ArrayJsonSchemaPropertyInputItems'
      required:
        - items
      title: ArrayJsonSchemaPropertyInput
    type_:ObjectJsonSchemaPropertyInputPropertiesValue:
      oneOf:
        - $ref: '#/components/schemas/type_:LiteralJsonSchemaProperty'
        - $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyInput'
        - $ref: '#/components/schemas/type_:ArrayJsonSchemaPropertyInput'
      title: ObjectJsonSchemaPropertyInputPropertiesValue
    type_:RequiredConstraint:
      type: object
      properties:
        required:
          type: array
          items:
            type: string
      required:
        - required
      description: A set of fields that must all be present to satisfy this constraint.
      title: RequiredConstraint
    type_:RequiredConstraints:
      type: object
      properties:
        any_of:
          type: array
          items:
            $ref: '#/components/schemas/type_:RequiredConstraint'
        all_of:
          type: array
          items:
            $ref: '#/components/schemas/type_:RequiredConstraint'
      description: >-
        Wrapper for anyOf/allOf composition constraints scoped to required
        fields.
      title: RequiredConstraints
    type_:ObjectJsonSchemaPropertyInput:
      type: object
      properties:
        type:
          type: string
          enum:
            - object
        required:
          type: array
          items:
            type: string
        description:
          type: string
          default: ''
        properties:
          type: object
          additionalProperties:
            $ref: >-
              #/components/schemas/type_:ObjectJsonSchemaPropertyInputPropertiesValue
        required_constraints:
          $ref: '#/components/schemas/type_:RequiredConstraints'
      title: ObjectJsonSchemaPropertyInput
    type_:DynamicVariablesConfigDynamicVariablePlaceholdersValue:
      oneOf:
        - type: string
        - type: number
          format: double
        - type: integer
        - type: boolean
      title: DynamicVariablesConfigDynamicVariablePlaceholdersValue
    type_:DynamicVariablesConfig:
      type: object
      properties:
        dynamic_variable_placeholders:
          type: object
          additionalProperties:
            $ref: >-
              #/components/schemas/type_:DynamicVariablesConfigDynamicVariablePlaceholdersValue
          description: A dictionary of dynamic variable placeholders and their values
      title: DynamicVariablesConfig
    type_:ToolExecutionMode:
      type: string
      enum:
        - immediate
        - post_tool_speech
        - async
      default: immediate
      title: ToolExecutionMode
    type_:AgentTransfer:
      type: object
      properties:
        agent_id:
          type: string
        condition:
          type: string
        delay_ms:
          type: integer
          default: 0
        transfer_message:
          type: string
        enable_transferred_agent_first_message:
          type: boolean
          default: false
        is_workflow_node_transfer:
          type: boolean
          default: false
      required:
        - agent_id
        - condition
      title: AgentTransfer
    type_:PhoneNumberTransferCustomSipHeadersItem:
      oneOf:
        - type: object
          properties:
            type:
              type: string
              enum:
                - dynamic
              description: 'Discriminator value: dynamic'
            key:
              type: string
              description: The SIP header name (e.g., 'X-Customer-ID')
            value:
              type: string
              description: The dynamic variable name to resolve
          required:
            - type
            - key
            - value
        - type: object
          properties:
            type:
              type: string
              enum:
                - static
              description: 'Discriminator value: static'
            key:
              type: string
              description: The SIP header name (e.g., 'X-Customer-ID')
            value:
              type: string
              description: The header value
          required:
            - type
            - key
            - value
      discriminator:
        propertyName: type
      title: PhoneNumberTransferCustomSipHeadersItem
    type_:PhoneNumberTransferTransferDestination:
      oneOf:
        - type: object
          properties:
            type:
              type: string
              enum:
                - phone
              description: 'Discriminator value: phone'
            phone_number:
              type: string
          required:
            - type
            - phone_number
        - type: object
          properties:
            type:
              type: string
              enum:
                - phone_dynamic_variable
              description: 'Discriminator value: phone_dynamic_variable'
            phone_number:
              type: string
          required:
            - type
            - phone_number
        - type: object
          properties:
            type:
              type: string
              enum:
                - sip_uri
              description: 'Discriminator value: sip_uri'
            sip_uri:
              type: string
          required:
            - type
            - sip_uri
        - type: object
          properties:
            type:
              type: string
              enum:
                - sip_uri_dynamic_variable
              description: 'Discriminator value: sip_uri_dynamic_variable'
            sip_uri:
              type: string
          required:
            - type
            - sip_uri
      discriminator:
        propertyName: type
      title: PhoneNumberTransferTransferDestination
    type_:TransferTypeEnum:
      type: string
      enum:
        - blind
        - conference
        - sip_refer
      default: conference
      title: TransferTypeEnum
    type_:PhoneNumberTransferPostDialDigits:
      oneOf:
        - type: object
          properties:
            type:
              type: string
              enum:
                - dynamic
              description: 'Discriminator value: dynamic'
            value:
              type: string
              description: The dynamic variable name to resolve
          required:
            - type
            - value
        - type: object
          properties:
            type:
              type: string
              enum:
                - static
              description: 'Discriminator value: static'
            value:
              type: string
              description: >-
                DTMF digits to send after call connects (e.g., 'ww1234' for
                extension)
          required:
            - type
            - value
      discriminator:
        propertyName: type
      title: PhoneNumberTransferPostDialDigits
    type_:PhoneNumberTransfer:
      type: object
      properties:
        custom_sip_headers:
          type: array
          items:
            $ref: '#/components/schemas/type_:PhoneNumberTransferCustomSipHeadersItem'
          description: >-
            Custom SIP headers to include when transferring the call. Each
            header can be either a static value or a dynamic variable reference.
        transfer_destination:
          $ref: '#/components/schemas/type_:PhoneNumberTransferTransferDestination'
        phone_number:
          type: string
        condition:
          type: string
        transfer_type:
          $ref: '#/components/schemas/type_:TransferTypeEnum'
        post_dial_digits:
          $ref: '#/components/schemas/type_:PhoneNumberTransferPostDialDigits'
          description: >-
            DTMF digits to send after call connects (e.g., 'ww1234' for
            extension). Can be either a static value or a dynamic variable
            reference. Use 'w' for 0.5s pause. Only supported for Twilio
            transfers.
      required:
        - condition
      title: PhoneNumberTransfer
    type_:SystemToolConfigInputParams:
      oneOf:
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - end_call
              description: 'Discriminator value: end_call'
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - language_detection
              description: 'Discriminator value: language_detection'
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - play_keypad_touch_tone
              description: 'Discriminator value: play_keypad_touch_tone'
            use_out_of_band_dtmf:
              type: boolean
              default: true
              description: >-
                If true, send DTMF tones out-of-band using RFC 4733 (useful for
                SIP calls only). If false, send DTMF as in-band audio tones
                (works for all call types).
            suppress_turn_after_dtmf:
              type: boolean
              default: false
              description: >-
                If true, the agent will not generate further speech after
                playing DTMF tones. This prevents the agent's speech from
                interfering with IVR systems.
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - skip_turn
              description: 'Discriminator value: skip_turn'
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - transfer_to_agent
              description: 'Discriminator value: transfer_to_agent'
            transfers:
              type: array
              items:
                $ref: '#/components/schemas/type_:AgentTransfer'
          required:
            - system_tool_type
            - transfers
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - transfer_to_number
              description: 'Discriminator value: transfer_to_number'
            transfers:
              type: array
              items:
                $ref: '#/components/schemas/type_:PhoneNumberTransfer'
            enable_client_message:
              type: boolean
              default: true
              description: >-
                Whether to play a message to the client while they wait for
                transfer. Defaults to true for backward compatibility.
          required:
            - system_tool_type
            - transfers
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - voicemail_detection
              description: 'Discriminator value: voicemail_detection'
            voicemail_message:
              type: string
              description: >-
                Optional message to leave on voicemail when detected. If not
                provided, the call will end immediately when voicemail is
                detected. Supports dynamic variables (e.g., {{system__time}},
                {{system__call_duration_secs}}, {{custom_variable}}).
          required:
            - system_tool_type
      discriminator:
        propertyName: system_tool_type
      title: SystemToolConfigInputParams
    type_:ConvAiSecretLocator:
      type: object
      properties:
        secret_id:
          type: string
      required:
        - secret_id
      description: Used to reference a secret from the agent's secret store.
      title: ConvAiSecretLocator
    type_:ConvAiDynamicVariable:
      type: object
      properties:
        variable_name:
          type: string
      required:
        - variable_name
      description: Used to reference a dynamic variable.
      title: ConvAiDynamicVariable
    type_:ConvAiEnvVarLocator:
      type: object
      properties:
        env_var_label:
          type: string
      required:
        - env_var_label
      description: Used to reference an environment variable by label.
      title: ConvAiEnvVarLocator
    type_:WebhookToolApiSchemaConfigInputRequestHeadersValue:
      oneOf:
        - type: string
        - $ref: '#/components/schemas/type_:ConvAiSecretLocator'
        - $ref: '#/components/schemas/type_:ConvAiDynamicVariable'
        - $ref: '#/components/schemas/type_:ConvAiEnvVarLocator'
      title: WebhookToolApiSchemaConfigInputRequestHeadersValue
    type_:WebhookToolApiSchemaConfigInputMethod:
      type: string
      enum:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
      default: GET
      description: The HTTP method to use for the webhook
      title: WebhookToolApiSchemaConfigInputMethod
    type_:QueryParamsJsonSchema:
      type: object
      properties:
        properties:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/type_:LiteralJsonSchemaProperty'
        required:
          type: array
          items:
            type: string
      required:
        - properties
      title: QueryParamsJsonSchema
    type_:WebhookToolApiSchemaConfigInputContentType:
      type: string
      enum:
        - application/json
        - application/x-www-form-urlencoded
      default: application/json
      description: >-
        Content type for the request body. Only applies to POST/PUT/PATCH
        requests.
      title: WebhookToolApiSchemaConfigInputContentType
    type_:AuthConnectionLocator:
      type: object
      properties:
        auth_connection_id:
          type: string
      required:
        - auth_connection_id
      description: >-
        Used to reference an auth connection from the workspace's auth
        connection store.
      title: AuthConnectionLocator
    type_:EnvironmentAuthConnectionLocator:
      type: object
      properties:
        env_var_label:
          type: string
      required:
        - env_var_label
      description: |-
        References an environment variable of type 'auth_connection' by label.
        At runtime, resolves to the auth connection for the current environment,
        falling back to the default environment.
      title: EnvironmentAuthConnectionLocator
    type_:WebhookToolApiSchemaConfigInputAuthConnection:
      oneOf:
        - $ref: '#/components/schemas/type_:AuthConnectionLocator'
        - $ref: '#/components/schemas/type_:EnvironmentAuthConnectionLocator'
      description: Optional auth connection to use for authentication with this webhook
      title: WebhookToolApiSchemaConfigInputAuthConnection
    type_:WebhookToolApiSchemaConfigInput:
      type: object
      properties:
        request_headers:
          type: object
          additionalProperties:
            $ref: >-
              #/components/schemas/type_:WebhookToolApiSchemaConfigInputRequestHeadersValue
          description: Headers that should be included in the request
        url:
          type: string
          description: >-
            The URL that the webhook will be sent to. May include path
            parameters, e.g. https://example.com/agents/{agent_id}
        method:
          $ref: '#/components/schemas/type_:WebhookToolApiSchemaConfigInputMethod'
          description: The HTTP method to use for the webhook
        path_params_schema:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/type_:LiteralJsonSchemaProperty'
          description: >-
            Schema for path parameters, if any. The keys should match the
            placeholders in the URL.
        query_params_schema:
          $ref: '#/components/schemas/type_:QueryParamsJsonSchema'
          description: >-
            Schema for any query params, if any. These will be added to end of
            the URL as query params. Note: properties in a query param must all
            be literal types
        request_body_schema:
          $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyInput'
          description: >-
            Schema for the body parameters, if any. Used for POST/PATCH/PUT
            requests. The schema should be an object which will be sent as the
            json body
        content_type:
          $ref: >-
            #/components/schemas/type_:WebhookToolApiSchemaConfigInputContentType
          description: >-
            Content type for the request body. Only applies to POST/PUT/PATCH
            requests.
        auth_connection:
          $ref: >-
            #/components/schemas/type_:WebhookToolApiSchemaConfigInputAuthConnection
          description: Optional auth connection to use for authentication with this webhook
      required:
        - url
      title: WebhookToolApiSchemaConfigInput
    type_:ToolRequestModelToolConfig:
      oneOf:
        - type: object
          properties:
            type:
              type: string
              enum:
                - client
              description: 'Discriminator value: client'
            name:
              type: string
            description:
              type: string
              description: Description of when the tool should be used and what it does.
            response_timeout_secs:
              type: integer
              default: 20
              description: >-
                The maximum time in seconds to wait for the tool call to
                complete. Must be between 1 and 120 seconds (inclusive).
            disable_interruptions:
              type: boolean
              default: false
              description: >-
                If true, the user will not be able to interrupt the agent while
                this tool is running.
            force_pre_tool_speech:
              type: boolean
              default: false
              description: If true, the agent will speak before the tool call.
            assignments:
              type: array
              items:
                $ref: '#/components/schemas/type_:DynamicVariableAssignment'
              description: >-
                Configuration for extracting values from tool responses and
                assigning them to dynamic variables
            tool_call_sound:
              $ref: '#/components/schemas/type_:ToolCallSoundType'
              description: >-
                Predefined tool call sound type to play during tool execution.
                If not specified, no tool call sound will be played.
            tool_call_sound_behavior:
              $ref: '#/components/schemas/type_:ToolCallSoundBehavior'
              description: >-
                Determines when the tool call sound should play. 'auto' only
                plays when there's pre-tool speech, 'always' plays for every
                tool call.
            tool_error_handling_mode:
              $ref: '#/components/schemas/type_:ToolErrorHandlingMode'
              description: >-
                Controls how tool errors are processed before being shared with
                the agent. 'auto' determines handling based on tool type
                (summarized for native integrations, hide for others),
                'summarized' sends an LLM-generated summary, 'passthrough' sends
                the raw error, 'hide' does not share the error with the agent.
            parameters:
              $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyInput'
              description: Schema for any parameters to pass to the client
            expects_response:
              type: boolean
              default: false
              description: >-
                If true, calling this tool should block the conversation until
                the client responds with some response which is passed to the
                llm. If false then we will continue the conversation without
                waiting for the client to respond, this is useful to show
                content to a user but not block the conversation
            dynamic_variables:
              $ref: '#/components/schemas/type_:DynamicVariablesConfig'
              description: Configuration for dynamic variables
            execution_mode:
              $ref: '#/components/schemas/type_:ToolExecutionMode'
              description: >-
                Determines when and how the tool executes: 'immediate' executes
                the tool right away when requested by the LLM,
                'post_tool_speech' waits for the agent to finish speaking before
                executing, 'async' runs the tool in the background without
                blocking - best for long-running operations.
          required:
            - type
            - name
            - description
        - type: object
          properties:
            type:
              type: string
              enum:
                - mcp
              description: 'Discriminator value: mcp'
            value:
              description: Any type
          required:
            - type
            - value
        - type: object
          properties:
            type:
              type: string
              enum:
                - system
              description: The type of tool
            name:
              type: string
            description:
              type: string
              default: ''
              description: >-
                Description of when the tool should be used and what it does.
                Leave empty to use the default description that's optimized for
                the specific tool type.
            response_timeout_secs:
              type: integer
              default: 20
              description: >-
                The maximum time in seconds to wait for the tool call to
                complete.
            disable_interruptions:
              type: boolean
              default: false
              description: >-
                If true, the user will not be able to interrupt the agent while
                this tool is running.
            force_pre_tool_speech:
              type: boolean
              default: false
              description: If true, the agent will speak before the tool call.
            assignments:
              type: array
              items:
                $ref: '#/components/schemas/type_:DynamicVariableAssignment'
              description: >-
                Configuration for extracting values from tool responses and
                assigning them to dynamic variables
            tool_call_sound:
              $ref: '#/components/schemas/type_:ToolCallSoundType'
              description: >-
                Predefined tool call sound type to play during tool execution.
                If not specified, no tool call sound will be played.
            tool_call_sound_behavior:
              $ref: '#/components/schemas/type_:ToolCallSoundBehavior'
              description: >-
                Determines when the tool call sound should play. 'auto' only
                plays when there's pre-tool speech, 'always' plays for every
                tool call.
            tool_error_handling_mode:
              $ref: '#/components/schemas/type_:ToolErrorHandlingMode'
              description: >-
                Controls how tool errors are processed before being shared with
                the agent. 'auto' determines handling based on tool type
                (summarized for native integrations, hide for others),
                'summarized' sends an LLM-generated summary, 'passthrough' sends
                the raw error, 'hide' does not share the error with the agent.
            params:
              $ref: '#/components/schemas/type_:SystemToolConfigInputParams'
          required:
            - type
            - name
            - params
        - type: object
          properties:
            type:
              type: string
              enum:
                - webhook
              description: 'Discriminator value: webhook'
            name:
              type: string
            description:
              type: string
              description: Description of when the tool should be used and what it does.
            response_timeout_secs:
              type: integer
              default: 20
              description: >-
                The maximum time in seconds to wait for the tool call to
                complete. Must be between 5 and 120 seconds (inclusive).
            disable_interruptions:
              type: boolean
              default: false
              description: >-
                If true, the user will not be able to interrupt the agent while
                this tool is running.
            force_pre_tool_speech:
              type: boolean
              default: false
              description: If true, the agent will speak before the tool call.
            assignments:
              type: array
              items:
                $ref: '#/components/schemas/type_:DynamicVariableAssignment'
              description: >-
                Configuration for extracting values from tool responses and
                assigning them to dynamic variables
            tool_call_sound:
              $ref: '#/components/schemas/type_:ToolCallSoundType'
              description: >-
                Predefined tool call sound type to play during tool execution.
                If not specified, no tool call sound will be played.
            tool_call_sound_behavior:
              $ref: '#/components/schemas/type_:ToolCallSoundBehavior'
              description: >-
                Determines when the tool call sound should play. 'auto' only
                plays when there's pre-tool speech, 'always' plays for every
                tool call.
            tool_error_handling_mode:
              $ref: '#/components/schemas/type_:ToolErrorHandlingMode'
              description: >-
                Controls how tool errors are processed before being shared with
                the agent. 'auto' determines handling based on tool type
                (summarized for native integrations, hide for others),
                'summarized' sends an LLM-generated summary, 'passthrough' sends
                the raw error, 'hide' does not share the error with the agent.
            dynamic_variables:
              $ref: '#/components/schemas/type_:DynamicVariablesConfig'
              description: Configuration for dynamic variables
            execution_mode:
              $ref: '#/components/schemas/type_:ToolExecutionMode'
              description: >-
                Determines when and how the tool executes: 'immediate' executes
                the tool right away when requested by the LLM,
                'post_tool_speech' waits for the agent to finish speaking before
                executing, 'async' runs the tool in the background without
                blocking - best for long-running operations.
            api_schema:
              $ref: '#/components/schemas/type_:WebhookToolApiSchemaConfigInput'
              description: >-
                The schema for the outgoing webhoook, including parameters and
                URL specification
          required:
            - type
            - name
            - description
            - api_schema
      discriminator:
        propertyName: type
      description: Configuration for the tool
      title: ToolRequestModelToolConfig
    type_:ToolRequestModel:
      type: object
      properties:
        tool_config:
          $ref: '#/components/schemas/type_:ToolRequestModelToolConfig'
          description: Configuration for the tool
      required:
        - tool_config
      title: ToolRequestModel
    type_:ArrayJsonSchemaPropertyOutputItems:
      oneOf:
        - $ref: '#/components/schemas/type_:LiteralJsonSchemaProperty'
        - $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyOutput'
        - $ref: '#/components/schemas/type_:ArrayJsonSchemaPropertyOutput'
      title: ArrayJsonSchemaPropertyOutputItems
    type_:ArrayJsonSchemaPropertyOutput:
      type: object
      properties:
        type:
          type: string
          enum:
            - array
        description:
          type: string
          default: ''
        items:
          $ref: '#/components/schemas/type_:ArrayJsonSchemaPropertyOutputItems'
      required:
        - items
      title: ArrayJsonSchemaPropertyOutput
    type_:ObjectJsonSchemaPropertyOutputPropertiesValue:
      oneOf:
        - $ref: '#/components/schemas/type_:LiteralJsonSchemaProperty'
        - $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyOutput'
        - $ref: '#/components/schemas/type_:ArrayJsonSchemaPropertyOutput'
      title: ObjectJsonSchemaPropertyOutputPropertiesValue
    type_:ObjectJsonSchemaPropertyOutput:
      type: object
      properties:
        type:
          type: string
          enum:
            - object
        required:
          type: array
          items:
            type: string
        description:
          type: string
          default: ''
        properties:
          type: object
          additionalProperties:
            $ref: >-
              #/components/schemas/type_:ObjectJsonSchemaPropertyOutputPropertiesValue
        required_constraints:
          $ref: '#/components/schemas/type_:RequiredConstraints'
      title: ObjectJsonSchemaPropertyOutput
    type_:SystemToolConfigOutputParams:
      oneOf:
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - end_call
              description: 'Discriminator value: end_call'
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - language_detection
              description: 'Discriminator value: language_detection'
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - play_keypad_touch_tone
              description: 'Discriminator value: play_keypad_touch_tone'
            use_out_of_band_dtmf:
              type: boolean
              default: true
              description: >-
                If true, send DTMF tones out-of-band using RFC 4733 (useful for
                SIP calls only). If false, send DTMF as in-band audio tones
                (works for all call types).
            suppress_turn_after_dtmf:
              type: boolean
              default: false
              description: >-
                If true, the agent will not generate further speech after
                playing DTMF tones. This prevents the agent's speech from
                interfering with IVR systems.
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - skip_turn
              description: 'Discriminator value: skip_turn'
          required:
            - system_tool_type
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - transfer_to_agent
              description: 'Discriminator value: transfer_to_agent'
            transfers:
              type: array
              items:
                $ref: '#/components/schemas/type_:AgentTransfer'
          required:
            - system_tool_type
            - transfers
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - transfer_to_number
              description: 'Discriminator value: transfer_to_number'
            transfers:
              type: array
              items:
                $ref: '#/components/schemas/type_:PhoneNumberTransfer'
            enable_client_message:
              type: boolean
              default: true
              description: >-
                Whether to play a message to the client while they wait for
                transfer. Defaults to true for backward compatibility.
          required:
            - system_tool_type
            - transfers
        - type: object
          properties:
            system_tool_type:
              type: string
              enum:
                - voicemail_detection
              description: 'Discriminator value: voicemail_detection'
            voicemail_message:
              type: string
              description: >-
                Optional message to leave on voicemail when detected. If not
                provided, the call will end immediately when voicemail is
                detected. Supports dynamic variables (e.g., {{system__time}},
                {{system__call_duration_secs}}, {{custom_variable}}).
          required:
            - system_tool_type
      discriminator:
        propertyName: system_tool_type
      title: SystemToolConfigOutputParams
    type_:WebhookToolApiSchemaConfigOutputRequestHeadersValue:
      oneOf:
        - type: string
        - $ref: '#/components/schemas/type_:ConvAiSecretLocator'
        - $ref: '#/components/schemas/type_:ConvAiDynamicVariable'
        - $ref: '#/components/schemas/type_:ConvAiEnvVarLocator'
      title: WebhookToolApiSchemaConfigOutputRequestHeadersValue
    type_:WebhookToolApiSchemaConfigOutputMethod:
      type: string
      enum:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
      default: GET
      description: The HTTP method to use for the webhook
      title: WebhookToolApiSchemaConfigOutputMethod
    type_:WebhookToolApiSchemaConfigOutputContentType:
      type: string
      enum:
        - application/json
        - application/x-www-form-urlencoded
      default: application/json
      description: >-
        Content type for the request body. Only applies to POST/PUT/PATCH
        requests.
      title: WebhookToolApiSchemaConfigOutputContentType
    type_:WebhookToolApiSchemaConfigOutputAuthConnection:
      oneOf:
        - $ref: '#/components/schemas/type_:AuthConnectionLocator'
        - $ref: '#/components/schemas/type_:EnvironmentAuthConnectionLocator'
      description: Optional auth connection to use for authentication with this webhook
      title: WebhookToolApiSchemaConfigOutputAuthConnection
    type_:WebhookToolApiSchemaConfigOutput:
      type: object
      properties:
        request_headers:
          type: object
          additionalProperties:
            $ref: >-
              #/components/schemas/type_:WebhookToolApiSchemaConfigOutputRequestHeadersValue
          description: Headers that should be included in the request
        url:
          type: string
          description: >-
            The URL that the webhook will be sent to. May include path
            parameters, e.g. https://example.com/agents/{agent_id}
        method:
          $ref: '#/components/schemas/type_:WebhookToolApiSchemaConfigOutputMethod'
          description: The HTTP method to use for the webhook
        path_params_schema:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/type_:LiteralJsonSchemaProperty'
          description: >-
            Schema for path parameters, if any. The keys should match the
            placeholders in the URL.
        query_params_schema:
          $ref: '#/components/schemas/type_:QueryParamsJsonSchema'
          description: >-
            Schema for any query params, if any. These will be added to end of
            the URL as query params. Note: properties in a query param must all
            be literal types
        request_body_schema:
          $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyOutput'
          description: >-
            Schema for the body parameters, if any. Used for POST/PATCH/PUT
            requests. The schema should be an object which will be sent as the
            json body
        content_type:
          $ref: >-
            #/components/schemas/type_:WebhookToolApiSchemaConfigOutputContentType
          description: >-
            Content type for the request body. Only applies to POST/PUT/PATCH
            requests.
        auth_connection:
          $ref: >-
            #/components/schemas/type_:WebhookToolApiSchemaConfigOutputAuthConnection
          description: Optional auth connection to use for authentication with this webhook
      required:
        - url
      title: WebhookToolApiSchemaConfigOutput
    type_:ToolResponseModelToolConfig:
      oneOf:
        - type: object
          properties:
            type:
              type: string
              enum:
                - client
              description: 'Discriminator value: client'
            name:
              type: string
            description:
              type: string
              description: Description of when the tool should be used and what it does.
            response_timeout_secs:
              type: integer
              default: 20
              description: >-
                The maximum time in seconds to wait for the tool call to
                complete. Must be between 1 and 120 seconds (inclusive).
            disable_interruptions:
              type: boolean
              default: false
              description: >-
                If true, the user will not be able to interrupt the agent while
                this tool is running.
            force_pre_tool_speech:
              type: boolean
              default: false
              description: If true, the agent will speak before the tool call.
            assignments:
              type: array
              items:
                $ref: '#/components/schemas/type_:DynamicVariableAssignment'
              description: >-
                Configuration for extracting values from tool responses and
                assigning them to dynamic variables
            tool_call_sound:
              $ref: '#/components/schemas/type_:ToolCallSoundType'
              description: >-
                Predefined tool call sound type to play during tool execution.
                If not specified, no tool call sound will be played.
            tool_call_sound_behavior:
              $ref: '#/components/schemas/type_:ToolCallSoundBehavior'
              description: >-
                Determines when the tool call sound should play. 'auto' only
                plays when there's pre-tool speech, 'always' plays for every
                tool call.
            tool_error_handling_mode:
              $ref: '#/components/schemas/type_:ToolErrorHandlingMode'
              description: >-
                Controls how tool errors are processed before being shared with
                the agent. 'auto' determines handling based on tool type
                (summarized for native integrations, hide for others),
                'summarized' sends an LLM-generated summary, 'passthrough' sends
                the raw error, 'hide' does not share the error with the agent.
            parameters:
              $ref: '#/components/schemas/type_:ObjectJsonSchemaPropertyOutput'
              description: Schema for any parameters to pass to the client
            expects_response:
              type: boolean
              default: false
              description: >-
                If true, calling this tool should block the conversation until
                the client responds with some response which is passed to the
                llm. If false then we will continue the conversation without
                waiting for the client to respond, this is useful to show
                content to a user but not block the conversation
            dynamic_variables:
              $ref: '#/components/schemas/type_:DynamicVariablesConfig'
              description: Configuration for dynamic variables
            execution_mode:
              $ref: '#/components/schemas/type_:ToolExecutionMode'
              description: >-
                Determines when and how the tool executes: 'immediate' executes
                the tool right away when requested by the LLM,
                'post_tool_speech' waits for the agent to finish speaking before
                executing, 'async' runs the tool in the background without
                blocking - best for long-running operations.
          required:
            - type
            - name
            - description
        - type: object
          properties:
            type:
              type: string
              enum:
                - mcp
              description: 'Discriminator value: mcp'
            value:
              description: Any type
          required:
            - type
            - value
        - type: object
          properties:
            type:
              type: string
              enum:
                - system
              description: The type of tool
            name:
              type: string
            description:
              type: string
              default: ''
              description: >-
                Description of when the tool should be used and what it does.
                Leave empty to use the default description that's optimized for
                the specific tool type.
            response_timeout_secs:
              type: integer
              default: 20
              description: >-
                The maximum time in seconds to wait for the tool call to
                complete.
            disable_interruptions:
              type: boolean
              default: false
              description: >-
                If true, the user will not be able to interrupt the agent while
                this tool is running.
            force_pre_tool_speech:
              type: boolean
              default: false
              description: If true, the agent will speak before the tool call.
            assignments:
              type: array
              items:
                $ref: '#/components/schemas/type_:DynamicVariableAssignment'
              description: >-
                Configuration for extracting values from tool responses and
                assigning them to dynamic variables
            tool_call_sound:
              $ref: '#/components/schemas/type_:ToolCallSoundType'
              description: >-
                Predefined tool call sound type to play during tool execution.
                If not specified, no tool call sound will be played.
            tool_call_sound_behavior:
              $ref: '#/components/schemas/type_:ToolCallSoundBehavior'
              description: >-
                Determines when the tool call sound should play. 'auto' only
                plays when there's pre-tool speech, 'always' plays for every
                tool call.
            tool_error_handling_mode:
              $ref: '#/components/schemas/type_:ToolErrorHandlingMode'
              description: >-
                Controls how tool errors are processed before being shared with
                the agent. 'auto' determines handling based on tool type
                (summarized for native integrations, hide for others),
                'summarized' sends an LLM-generated summary, 'passthrough' sends
                the raw error, 'hide' does not share the error with the agent.
            params:
              $ref: '#/components/schemas/type_:SystemToolConfigOutputParams'
          required:
            - type
            - name
            - params
        - type: object
          properties:
            type:
              type: string
              enum:
                - webhook
              description: 'Discriminator value: webhook'
            name:
              type: string
            description:
              type: string
              description: Description of when the tool should be used and what it does.
            response_timeout_secs:
              type: integer
              default: 20
              description: >-
                The maximum time in seconds to wait for the tool call to
                complete. Must be between 5 and 120 seconds (inclusive).
            disable_interruptions:
              type: boolean
              default: false
              description: >-
                If true, the user will not be able to interrupt the agent while
                this tool is running.
            force_pre_tool_speech:
              type: boolean
              default: false
              description: If true, the agent will speak before the tool call.
            assignments:
              type: array
              items:
                $ref: '#/components/schemas/type_:DynamicVariableAssignment'
              description: >-
                Configuration for extracting values from tool responses and
                assigning them to dynamic variables
            tool_call_sound:
              $ref: '#/components/schemas/type_:ToolCallSoundType'
              description: >-
                Predefined tool call sound type to play during tool execution.
                If not specified, no tool call sound will be played.
            tool_call_sound_behavior:
              $ref: '#/components/schemas/type_:ToolCallSoundBehavior'
              description: >-
                Determines when the tool call sound should play. 'auto' only
                plays when there's pre-tool speech, 'always' plays for every
                tool call.
            tool_error_handling_mode:
              $ref: '#/components/schemas/type_:ToolErrorHandlingMode'
              description: >-
                Controls how tool errors are processed before being shared with
                the agent. 'auto' determines handling based on tool type
                (summarized for native integrations, hide for others),
                'summarized' sends an LLM-generated summary, 'passthrough' sends
                the raw error, 'hide' does not share the error with the agent.
            dynamic_variables:
              $ref: '#/components/schemas/type_:DynamicVariablesConfig'
              description: Configuration for dynamic variables
            execution_mode:
              $ref: '#/components/schemas/type_:ToolExecutionMode'
              description: >-
                Determines when and how the tool executes: 'immediate' executes
                the tool right away when requested by the LLM,
                'post_tool_speech' waits for the agent to finish speaking before
                executing, 'async' runs the tool in the background without
                blocking - best for long-running operations.
            api_schema:
              $ref: '#/components/schemas/type_:WebhookToolApiSchemaConfigOutput'
              description: >-
                The schema for the outgoing webhoook, including parameters and
                URL specification
          required:
            - type
            - name
            - description
            - api_schema
      discriminator:
        propertyName: type
      description: The type of tool
      title: ToolResponseModelToolConfig
    type_:ResourceAccessInfoRole:
      type: string
      enum:
        - admin
        - editor
        - commenter
        - viewer
      description: The role of the user making the request
      title: ResourceAccessInfoRole
    type_:ResourceAccessInfo:
      type: object
      properties:
        is_creator:
          type: boolean
          description: Whether the user making the request is the creator of the agent
        creator_name:
          type: string
          description: Name of the agent's creator
        creator_email:
          type: string
          description: Email of the agent's creator
        role:
          $ref: '#/components/schemas/type_:ResourceAccessInfoRole'
          description: The role of the user making the request
      required:
        - is_creator
        - creator_name
        - creator_email
        - role
      title: ResourceAccessInfo
    type_:ToolUsageStatsResponseModel:
      type: object
      properties:
        total_calls:
          type: integer
          default: 0
          description: The total number of calls to the tool
        avg_latency_secs:
          type: number
          format: double
      required:
        - avg_latency_secs
      title: ToolUsageStatsResponseModel
    type_:ToolResponseModel:
      type: object
      properties:
        id:
          type: string
        tool_config:
          $ref: '#/components/schemas/type_:ToolResponseModelToolConfig'
          description: The type of tool
        access_info:
          $ref: '#/components/schemas/type_:ResourceAccessInfo'
        usage_stats:
          $ref: '#/components/schemas/type_:ToolUsageStatsResponseModel'
      required:
        - id
        - tool_config
        - access_info
        - usage_stats
      title: ToolResponseModel
    type_:ValidationErrorLocItem:
      oneOf:
        - type: string
        - type: integer
      title: ValidationErrorLocItem
    type_:ValidationError:
      type: object
      properties:
        loc:
          type: array
          items:
            $ref: '#/components/schemas/type_:ValidationErrorLocItem'
        msg:
          type: string
        type:
          type: string
      required:
        - loc
        - msg
        - type
      title: ValidationError
    type_:HTTPValidationError:
      type: object
      properties:
        detail:
          type: array
          items:
            $ref: '#/components/schemas/type_:ValidationError'
      title: HTTPValidationError

```

## SDK Code Examples

```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

async function main() {
    const client = new ElevenLabsClient();
    await client.conversationalAi.tools.create({
        toolConfig: {
            type: "client",
            description: "description",
            name: "name",
            expectsResponse: false,
        },
    });
}
main();

```

```python
from elevenlabs import ElevenLabs, ToolRequestModel

client = ElevenLabs()

client.conversational_ai.tools.create(
    request=ToolRequestModel(
        tool_config={
            "type": "client",
            "description": "description",
            "name": "name",
            "expects_response": False
        },
    ),
)

```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.elevenlabs.io/v1/convai/tools"

	payload := strings.NewReader("{\n  \"tool_config\": {\n    \"type\": \"client\",\n    \"description\": \"description\",\n    \"name\": \"name\",\n    \"expects_response\": false\n  }\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.elevenlabs.io/v1/convai/tools")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Content-Type"] = 'application/json'
request.body = "{\n  \"tool_config\": {\n    \"type\": \"client\",\n    \"description\": \"description\",\n    \"name\": \"name\",\n    \"expects_response\": false\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.elevenlabs.io/v1/convai/tools")
  .header("Content-Type", "application/json")
  .body("{\n  \"tool_config\": {\n    \"type\": \"client\",\n    \"description\": \"description\",\n    \"name\": \"name\",\n    \"expects_response\": false\n  }\n}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.elevenlabs.io/v1/convai/tools', [
  'body' => '{
  "tool_config": {
    "type": "client",
    "description": "description",
    "name": "name",
    "expects_response": false
  }
}',
  'headers' => [
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.elevenlabs.io/v1/convai/tools");
var request = new RestRequest(Method.POST);
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"tool_config\": {\n    \"type\": \"client\",\n    \"description\": \"description\",\n    \"name\": \"name\",\n    \"expects_response\": false\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Content-Type": "application/json"]
let parameters = ["tool_config": [
    "type": "client",
    "description": "description",
    "name": "name",
    "expects_response": false
  ]] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.elevenlabs.io/v1/convai/tools")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```