I just used ChatGPT to rewrite my bookmarklet that summarizes webpages, and made the experiment to try to have 
ChatGPT write everything. I wanted to just define requirements, if possible. Here are some remarks how that went 
and what would have saved me some time if I had done it that way in the first place.,

I'm not quite sure whether it's possible to basically give it some requirements, give some basic instructions how to 
go on about writing an application, and basically have it run. There are some people who did this, I heard, but I'd 
assume they made quite a lot of failed experiments before that succeeded. You can try to have it pave it's own way 
by asking what it thinks it should do, but what comes out is often too general and suited for large applications you 
wouldn't want ChatGPT to write by itself. It's probably best to have a good idea how to go on writing that 
application, use ChatGPT to generate ideas. But im my (very simple case) it could nicely design the dialog, describe 
/ specify the flow of user interaction, and do much of the implementation, though guided by me. But I'm quite sure 
it wouldn't have went particularily good if I wasn't able to read and understand the code it was generating and not 
have known how to develop software. :-)

- Don't hesitate to edit your prompt again and again until the outcome is right. That's probably better than having a 
  huge dialog with many change requests. One approach is requesting some code, command ChatGPT to change it again 
  and again until it is right, and then go back to the original request of creating that code and edit that so that 
  the code comes out right in the first place. That's something nicely supported by the ChatGPT UI. The downside is 
  that it's creating a kind of tree structured dialog, so that it'd be difficult to review your discussions back 
  then, if you want to for some reason.  
- You can have it draw ascii art for examples / dialog or page structure proposals.
- If ask it general questions what steps to perform to create the application, the responses are often very general 
  and worth thinking about, but it's probably best to have a clear idea how to go on about the development yourself, 
  especially if it's for a quick proof of concept.

It's good to clear guidelines for the programming style, as e.g. in Javascript are various ways to do things. Some 
crucial things that worked for me here were:

    Let's get to the coding phase. I'd like a proof of concept style application - works fine, but as little code as 
    possible. But I want nicely readable and maintaineable code. Since this runs in the same browser window as the underlying page, I don't want to use any external frameworks like jQuery or any CSS frameworks - just plain Javascript and CSS / HTML. The name of the application is ChatGPTBookmarklet . Files should have the name prefix ChatGPTBookmarklet, global variables (if necessary) should have the prefix hpsChatGPT .

    Please structure it so that the javascript file creates an object in normal javascript object notation that is
    saved globally in window.hpsChatGPTBookmarklet and thus can easily be called later. The methods should be declared as
    attributes of that object in object notation - e.g. { init: function (basePath) {...} , openDialog:
    function () {...} } . Use variable name basePath instead of PATH_TO_APPLICATION . The Javascript object can be used to
    save variables that are needed later, e.g. basePath, the buttons, the divs etc. Mind that the bookmarklet can be called
    several times, and if it is called again it should again open the dialog (which could be still there but hidden). Please
    use fetch , possibly async functions to load things, instead of XmlHttpRequest. 

That's deserve some finetuning, of course, but it'll do for now.
