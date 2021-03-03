# ui5tips
Some tips and reusable code you can use and reuse throughout your openui5 and sapui5 applications.

* **loadingscreen**:
UI5 apps always take a little time to load. If you don't take any precautions, the user will be looking at a blank screen while the app is loading.
With minimal effort you can add a splash screen and loading indiciator to improve the user experience and give your app a more professional appearance.
With this sample you will learn a simple way to do just this.

* **css hacks**:
The UI5 look and feel is highly standardized and this is one of its benefits - especially if users are already accustomed to a SAP fiori application landscape.
But sometimes, a little css can improve the look, and sometimes the feel of certain ui5 controls, widgets and layouts.
These tips can be used as is or provide some inspiration to try your own ui5 css hacks.
Examples in this category include:
  * **TabContainerItem**: suppress the close buttons.

* **eventbuffer**:
Standard UI5 event handling will usually go a long way. Yet sometimes, certain user actions can cause ui5 objects to generate a lot of events within a small period of time.
A very common scenario is the liveSearch event - rather than firing a query to the backend for each and every keystroke, it makes much more sense to buffer these events, and react to only the last one, after some small timeout.
The bufferedEventHandler utility helps you to do just that, in a generic and reusable way.

* **uistate**:
Many ui5 controls and widgets allow some aspect of their appearance or behavior to be changed by the user. 
For example, a panel may be collapsed or expanded, a tab may be selected, columns width in a data grid may be adjused, and so on. We call all this the ui state.
When the user restarts the app, normally, the ui state is reset, This may not always be desirable.
This tip provides a way to centrally manage the ui state, and have it persisted - automatically and without requiring intrusive custom code sprinkled through your apps.