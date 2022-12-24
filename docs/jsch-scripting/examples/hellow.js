// swing application example.
importPackage(Packages.javax.swing, java.awt, java.awt.event);
importPackage(Packages.info.clearthought.layout);
//
const log = console.timedf("hello");
log(module.uri, arguments);

function hello_main() {
    const main = new JFrame();
    main.setTitle("Hello");
    main.setSize(600, 480);
    main.setLocationRelativeTo(null);  // 居中
    const jTabbedpane = new JTabbedPane();
    main.setResizable(false);
    main.add(jTabbedpane);
    main.setVisible(true);
    main.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
}

hello_main();
